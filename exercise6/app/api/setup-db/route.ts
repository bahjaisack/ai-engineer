import client from "@/lib/mongodb";

export async function GET() {
  try {
    await client.connect();

    const db = client.db("movie_chat");

    await db.collection("movies").createIndex({ genre: 1 });
    await db.collection("movies").createIndex({ rating: -1 });
    await db.collection("movies").createIndex({ title: 1 });

    await db.collection("users").createIndex({ age: 1 });

    await db.collection("conversations").createIndex({
      conversationId: 1,
    });

    return Response.json({
      success: true,
      message: "Database indexes created successfully.",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create database indexes.",
      },
      { status: 500 }
    );
  }
}