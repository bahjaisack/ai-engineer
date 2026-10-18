import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, UIMessage, convertToModelMessages, createIdGenerator, validateUIMessages } from 'ai';
import { auth } from '@/lib/auth';
import { loadChat, saveChat, getUserConversationById, updateConversationTitle } from '@/lib/chat';
import { getUserInfo } from '@/server/user';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
function createConversationTitle(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();

  if (!cleaned) return "New conversation";

  const firstSentence = cleaned.split(/[.!?]/)[0].trim();
  const title = firstSentence || cleaned;

  if (title.length <= 45) return title;

  return `${title.slice(0, 42).trimEnd()}...`;
}
export async function POST(req: Request) {
  try {
    // Get the authenticated session
    const user = await getUserInfo()

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { messages, message: singleMessage, id: conversationId } = body;

    if (!conversationId) {
      return new Response('Conversation ID is required', { status: 400 });
    }

    // Validate conversation ownership
    const conversation = await getUserConversationById(conversationId, user.user.id);
    if (!conversation) {
      return new Response('Conversation not found', { status: 404 });
    }

    let allMessages: UIMessage[];

    if (singleMessage) {
      const previousMessages = await loadChat(conversationId);
      allMessages = [...previousMessages, singleMessage];
    } else if (messages) {
      allMessages = messages;
    } else {
      return new Response('No messages provided', { status: 400 });
    }

    let validatedMessages: UIMessage[];
    try {
      validatedMessages = await validateUIMessages({
        messages: allMessages,
      });
    } catch (error) {
      console.error('Message validation failed:', error);
      validatedMessages = allMessages;
    }

    const result = streamText({
      model: openrouter('openrouter/free'),
      system: 'You are a helpful AI assistant. Be concise and helpful in your responses.',
      messages: await convertToModelMessages(validatedMessages),
    });

    // Use consumeStream to handle client disconnects (Vercel guide recommendation)
    result.consumeStream();

    console.log('About to return stream response with originalMessages:', validatedMessages.length);
    
    return result.toUIMessageStreamResponse({
      originalMessages: validatedMessages,
      // Generate consistent server-side IDs for persistence
      generateMessageId: createIdGenerator({
        prefix: 'msg',
        size: 16,
      }),
      onFinish: async ({ messages }) => {
        console.log('onFinish called with messages:', messages.length);
        console.log('All messages:', JSON.stringify(messages, null, 2));
        console.log('Last message role:', messages[messages.length - 1]?.role);
        console.log('Last message content:', messages[messages.length - 1]?.parts);
        try {
          const firstUserMessage = messages.find(
            (msg) => msg.role === "user"
        );
        
        const firstUserText = firstUserMessage?.parts
            ?.filter((part) => part.type === "text")
            .map((part) => part.text)
            .join(" ")
            .trim();
        
        if (firstUserText) {
            const title = createConversationTitle(firstUserText);
        
            await updateConversationTitle(
                conversationId,
                user.user.id,
                title
            );
        }
          await saveChat({ chatId: conversationId, messages });
          console.log('Messages saved successfully in onFinish');
        } catch (error) {
          console.error('Error saving messages in onFinish:', error);
        }
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}