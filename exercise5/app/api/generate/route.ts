import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {generateText} from  "ai";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});


export async function POST (request: Request){
    const {prompt} = await request.json();
    const {text} = await generateText({
        model: openrouter("openrouter/free"),
        prompt
    })
    return Response.json({text})
}