import { tool } from "ai";

import { z } from "zod";

import client from "@/lib/mongodb";

export const conversationTool = tool({

    description: "Save or retrieve conversation messages",

    inputSchema: z.object({

        action: z.enum(["save", "get"]).describe("Save or retrieve messages"),

        conversationId: z.string().describe("The conversation ID"),

        role: z.string().optional().describe("The message role"),

        content: z.string().optional().describe("The message content"),

    }),

    execute: async ({ action, conversationId, role, content }) => {

        try {

            await client.connect();

            const db = client.db("movie_chat");

            if (action === "save") {

                const result = await db.collection("conversations").insertOne({

                    conversationId,

                    role,

                    content,

                    createdAt: new Date(),

                });

                return {
                    success: true,
                    id: result.insertedId.toString(),
                };
            }

            const results = await db
                .collection("conversations")
                .find({ conversationId })
                .sort({ createdAt: 1 })
                .toArray();

            return {
                success: true,
                count: results.length,
                results,
            };

        } catch (error) {

            console.error("Conversation tool error:", error);

            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
            };
        }
    },
});