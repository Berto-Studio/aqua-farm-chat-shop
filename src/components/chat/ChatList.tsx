import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChatConversation } from "@/types/chat";

interface ChatListProps {
  conversations: ChatConversation[];
  activeConversationId?: string;
  basePath?: string;
}

export default function ChatList({
  conversations,
  activeConversationId,
  basePath = "/chat",
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((conversation) =>
    conversation.userName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayInMs = 86400000;

    if (diff < 86400000) {
      // Less than 24 hours, show time
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date);
    } else if (diff < dayInMs * 7) {
      // Less than a week, show day name
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      }).format(date);
    } else {
      // More than a week, show date
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    }
  };

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardContent className="flex h-full min-h-0 flex-col p-3">
        <div className="mb-3">
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const lastMessage =
                  conversation.messages[conversation.messages.length - 1];

                return (
                  <Link
                    key={conversation.id}
                    to={`${basePath}/${conversation.id}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      activeConversationId === conversation.id
                        ? "bg-primary/10"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{conversation.userName}</h3>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {lastMessage?.content}
                      </p>

                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
