'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { MessageSquare, Plus, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Conversation {
    id: string;
    title: string;
    updatedAt: Date | string;
}

interface ChatSidebarProps {
    conversations: Conversation[];
}

export default function ChatSidebar({ conversations }: ChatSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    function createNewChat() {
        router.push('/chat');
    }

    if (collapsed) {
        return (
            <aside className="flex w-14 shrink-0 flex-col items-center gap-3 border-r border-rose-100 bg-white p-2">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Expand sidebar"
                    onClick={() => setCollapsed(false)}
                >
                    <PanelLeft className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="New chat"
                    onClick={createNewChat}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </aside>
        );
    }

    return (
        <aside className="flex h-full w-64 shrink-0 flex-col border-r border-rose-100 bg-white">
            <div className="flex items-center justify-between border-b border-rose-100 p-4">
                <h2 className="font-semibold text-gray-900">Your chats</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Collapse sidebar"
                    onClick={() => setCollapsed(true)}
                >
                    <PanelLeftClose className="h-5 w-5" />
                </Button>
            </div>

            <div className="p-3">
                <Button
                    className="w-full justify-start gap-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600"
                    onClick={createNewChat}
                >
                    <Plus className="h-4 w-4" />
                    New chat
                </Button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
            {conversations
    .filter((conversation) => conversation.title?.trim())
    .map((conversation) => {
                    const active = pathname === `/chat/${conversation.id}`;

                    return (
                        <Link
                            key={conversation.id}
                            href={`/chat/${conversation.id}`}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                active
                                    ? 'bg-rose-100 font-medium text-rose-700'
                                    : 'text-gray-700 hover:bg-rose-50'
                            }`}
                        >
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate">
                                {conversation.title || 'New conversation'}
                            </span>
                        </Link>
                    );
                })}

                {conversations.length === 0 && (
                    <p className="px-3 py-4 text-sm text-gray-500">
                        No conversations yet.
                    </p>
                )}
            </nav>
        </aside>
    );
}
