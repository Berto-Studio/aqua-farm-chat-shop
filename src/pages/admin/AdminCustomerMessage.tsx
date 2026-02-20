import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatInterface from "@/components/chat/ChatInterface";
import { ChatMessage } from "@/types/chat";
import { getConversationById } from "@/data/chat";
import { getAdminUserById } from "@/data/adminDashboard";

export default function AdminCustomerMessage() {
  const navigate = useNavigate();
  const { userId, customerId } = useParams<{
    userId?: string;
    customerId?: string;
  }>();
  const resolvedUserId = userId || customerId;

  const user = useMemo(
    () => (resolvedUserId ? getAdminUserById(resolvedUserId) : undefined),
    [resolvedUserId]
  );

  const seedConversation = useMemo(
    () =>
      user?.conversationId ? getConversationById(user.conversationId) : undefined,
    [user?.conversationId]
  );

  const [messages, setMessages] = useState<ChatMessage[]>(
    seedConversation?.messages || []
  );

  if (!user) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">User not found.</CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: `admin-${Date.now()}`,
      senderId: "admin",
      receiverId: user.id,
      content,
      timestamp: new Date(),
      isRead: false,
      senderName: "Admin",
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(`/admin/users/${user.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Message {user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Button variant="outline" onClick={() => navigate("/admin/chat")}>
          <Mail className="mr-2 h-4 w-4" />
          Open Inbox
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>User Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Name
              </p>
              <p className="mt-1 font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Email
              </p>
              <p className="mt-1 font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Last Known Location
              </p>
              <p className="mt-1 font-semibold">{user.location}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Conversation
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {seedConversation
                  ? `Thread #${seedConversation.id}`
                  : "No previous thread found. Start a new message."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="min-h-[520px]">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId="admin"
          />
        </div>
      </div>
    </div>
  );
}
