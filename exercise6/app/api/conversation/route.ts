import client from "@/lib/mongodb";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            return Response.json({
                success: false,
                message: "conversationId is required",
            }, { status: 400 });
        }

        await client.connect();

        const db = client.db("movie_chat");

        const messages = await db.collection("conversations")
            .find({ conversationId })
            .sort({ createdAt: 1 })
            .toArray();

        return Response.json({
            success: true,
            messages,
        });

    } catch (error) {
        console.error("Conversation history error:", error);

        return Response.json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}