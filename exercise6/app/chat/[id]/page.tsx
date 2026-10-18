import Chat from "@/components/Chat";
import { getUserConversationById, loadChat } from "@/lib/chat";
import { getUserInfo } from "@/server/user";
import { redirect } from "next/navigation";

interface PagePros {
    params: Promise<{ id: string }>
}
const ChatPage = async ({ params }: PagePros) => {
    const { id } = await params;
    const user = await getUserInfo();
    if (!user) {
        redirect('/signin')
    }
    // validate conversationId
    console.log("Loading conversation ID:", id);
    const conversation = await getUserConversationById(id, user.user.id);
    if (!conversation) {
        redirect('/chat')
    }
    const initialMessages = await loadChat(id);
    console.log("Messages loaded for page:", initialMessages.length);
    console.log("Loaded messages:", initialMessages);
    return (
        <div className="h-full min-h-0 w-full min-w-0">
            <Chat
                conversationId={id}
                initialMessages={initialMessages}
                conversationTitle={conversation.title}
            />
        </div>
    )
}

export default ChatPage