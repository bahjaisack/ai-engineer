
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (typeof prompt !== "string" || !prompt.trim()) {
            return NextResponse.json(
                { error: "Please enter an image prompt." },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "OPENROUTER_API_KEY is not configured." },
                { status: 500 }
            );
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/images",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "openai/gpt-image-2",
                    prompt: prompt.trim(),
                    aspect_ratio: "1:1",
                }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error("OpenRouter image error:", result);

            return NextResponse.json(
                { error: result.error?.message || "Image generation failed." },
                { status: response.status }
            );
        }

        const generatedImage = result.data?.[0];

        if (!generatedImage?.b64_json) {
            return NextResponse.json(
                { error: "The model did not return an image." },
                { status: 502 }
            );
        }

        return NextResponse.json({
            image: `data:${generatedImage.media_type || "image/jpeg"};base64,${generatedImage.b64_json}`,
        });
    } catch (error) {
        console.error("Image generation error:", error);

        return NextResponse.json(
            { error: "Something went wrong generating the image." },
            { status: 500 }
        );
    }
}
