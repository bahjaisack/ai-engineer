import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { UIMessage } from "ai";
import { eq, asc } from "drizzle-orm";

export async function loadChat(conversationId: string): Promise<UIMessage[]> {
    console.log("loadChat received ID:", conversationId);


    const messages = await db.select()
        .from(message)
        .where(eq(message.conversationId, conversationId))
        .orderBy(asc(message.createdAt))
    console.log("Requested conversation ID:", conversationId);
    console.log("Message table query result:", messages);
    console.log("Database rows found:", messages.length);
    console.log(
        "Conversation IDs in matching rows:",
        messages.map((m) => m.conversationId)
    );
    return messages.map((message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant',
        parts: [{ type: "text", text: message.content }]
    }))

}


export async function saveChat({
    chatId,
    messages,
  }: {
    chatId: string;
    messages: UIMessage[];
  }): Promise<void> {
    const [conv] = await db
      .select({ userId: conversation.userId })
      .from(conversation)
      .where(eq(conversation.id, chatId))
      .limit(1);
  
    if (!conv) {
      throw new Error(`Conversation not found: ${chatId}`);
    }
  
    for (const msg of messages) {
      const content = msg.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");
  
      const [existing] = await db
        .select({ id: message.id })
        .from(message)
        .where(eq(message.id, msg.id))
        .limit(1);
  
      if (!existing) {
        await db.insert(message).values({
          id: msg.id,
          content,
          role: msg.role,
          conversationId: chatId,
          userId: conv.userId,
        });
      }
    }
  
    await db
      .update(conversation)
      .set({ updatedAt: new Date() })
      .where(eq(conversation.id, chatId));
  }
  