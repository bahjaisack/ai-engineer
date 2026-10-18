
import client from "../../../lib/mongodb";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText, tool, UIMessage, stepCountIs } from "ai";
import { z } from "zod";
import { databaseTool } from "../../../lib/tools/databaseTool";
import { omdbTool } from "../../../lib/tools/omdbTool";
import { dadJokeTool } from "../../../lib/tools/dadJokeTool";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: Request) {
    const { messages } = (await request.json()) as {
        messages: (UIMessage & {
            metadata?: { conversationId?: string };
        })[];
    };
    const conversationId = messages[messages.length - 1]?.metadata?.conversationId;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.role === "user") {

        const textPart = lastMessage.parts.find(part => part.type === "text");

        if (textPart?.type === "text") {

            const db = client.db("movie_chat");

            await client.connect();

            await db.collection("conversations").insertOne({
                conversationId,
                role: "user",
                content: textPart.text,
                createdAt: new Date(),
            });
        }
    }
    const result = streamText({
        model: openrouter("nvidia/nemotron-3.5-lightning:free"),

        system: `You are a helpful assistant for a movie chat application.

Choose tools based on the user's intent:
- Use the database tool only for questions about movies or users stored in the local database.
- Use the dadJoke tool when the user asks for a dad joke.
- Use the omdb tool when the user asks for information about a movie from the external movie database.
- Use the weather tool when the user asks for current weather in a location.
- For greetings and general questions, answer normally without a tool.

When the database tool is used, let the frontend display its results. Do not repeat those results in your text response. Do not show database messages such as "No movies found" for requests unrelated to the database.`,

        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
        tools: {
            database: databaseTool,


            omdb: omdbTool,

            dadJoke: dadJokeTool,


            weather: tool({
                description: 'Get current weather. The temperature value is in Celsius (°C). Report the exact value with °C; do not convert it to Fahrenheit.',
                inputSchema: z.object({
                    location: z.string().min(1).describe('The location to get the weather for'),
                }),
                execute: async ({ location }) => {
                    if (!process.env.OPENWEATHER_API_KEY) {
                        return {
                            success: false,
                            message: "Weather API key is not configured.",
                        };
                    }
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
                    );
                    if (!response.ok) {
                        return {
                            success: false,
                            message: `Weather API failed with status ${response.status}.`,
                        };
                    }
                    const data = await response.json();
                    console.log("data", data)
                    return {
                        location, temperature: data.main.temp,
                        unit: "Celsius",
                        temperatureUnit: "°C",
                    }
                },
            }),
        },
    });


    return result.toUIMessageStreamResponse({

        originalMessages: messages,

        onFinish: async ({ responseMessage }) => {
            console.log("AI RESPONSE:", responseMessage);

            const usedDatabaseTool = responseMessage.parts.some(
                (part) => part.type === "tool-database"
            );

            const text = responseMessage.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("");

            if (text && !usedDatabaseTool) {
                await client.connect();

                const db = client.db("movie_chat");

                await db.collection("conversations").insertOne({
                    conversationId,
                    role: "assistant",
                    content: text,
                    createdAt: new Date(),
                });
            }
        },

    });
}