
import { getUserConversations } from "@/lib/chat";
import { getUserInfo } from "@/server/user";
import { redirect } from "next/navigation";
import ChatSidebar from "@/components/ChatSideBar";

export default async function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUserInfo();

    if (!user) {
        redirect("/signin");
    }

    const conversations = await getUserConversations(user.user.id);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white">
        <ChatSidebar conversations={conversations} />
    
        <main className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
            {children}
        </main>
    </div>
    );
}
