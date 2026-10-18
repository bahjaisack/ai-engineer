import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { desc, eq, exists,and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// create a conversation for a user
export async function createConversation (userId: string, title?: string) {
    const conversationId = nanoid();
    await db.insert(conversation)
    .values({
        id: conversationId,
        title: title || "New conversation",
        userId,
    })
    return conversationId;
}

export async function updateConversationTitle(
    conversationId: string,
    userId: string,
    title: string
  ) {
    await db
      .update(conversation)
      .set({ title })
      .where(
        and(
          eq(conversation.id, conversationId),
          eq(conversation.userId, userId),
          eq(conversation.title, "New conversation")
        )
      );
  }

// get conversations

export async function getUserConversations(userId: string) {
    return await db
        .select()
        .from(conversation)
        .where(
            sql`${conversation.userId} = ${userId}
                AND EXISTS (
                    SELECT 1
                    FROM ${message}
                    WHERE ${message.conversationId} = ${conversation.id}
                )`
        )
        .orderBy(desc(conversation.updatedAt));
}

export async function getUserConversationById (conversationId: string,userId: string) {
    const result = await db.select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1)

    const conv = result[0];
    if(!conv || conv.userId !== userId) {
        return null;
    }
    return conv;

}