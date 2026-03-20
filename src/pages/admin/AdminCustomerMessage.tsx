import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatInterface from "@/components/chat/ChatInterface";
import {
  useAdminConversationMessages,
  useAdminConversations,
  useCreateAdminConversation,
  useMarkAdminConversationRead,
  useSendAdminConversationMessage,
} from "@/hooks/useAdminMessages";
import {
  toUnreadCount,
  useAutoMarkConversationRead,
} from "@/hooks/useAutoMarkConversationRead";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import { useAdminUser } from "@/hooks/useAdminUsers";
import {
  getUserDisplayName,
  getUserLocation,
  mapAdminMessageToChatMessage,
} from "@/lib/adminTransformers";
import { useUserStore } from "@/store/store";

export default function AdminCustomerMessage() {
  const navigate = useNavigate();
  const { userId, customerId } = useParams<{
    userId?: string;
    customerId?: string;
  }>();
  const resolvedUserId = userId || customerId;
  const adminUser = useUserStore((state) => state.user);
  const currentUserId = String(adminUser?.id ?? "admin");

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useAdminUser(resolvedUserId);
  const { data: conversationsResponse } = useAdminConversations();
  const { mutate: markConversationRead } = useMarkAdminConversationRead();
  const { mutateAsync: createConversationAsync, isPending: isCreatingConversation } =
    useCreateAdminConversation();
  const { mutateAsync: sendMessageAsync, isPending: isSendingMessage } =
    useSendAdminConversationMessage();

  const activeConversation = useMemo(() => {
    if (!user) return undefined;
    return (conversationsResponse?.data || []).find(
      (conversation) => String(conversation.user_id) === String(user.id)
    );
  }, [conversationsResponse?.data, user]);
  const activeConversationId = activeConversation?.id
    ? String(activeConversation.id)
    : undefined;
  const unreadMessageCount = toUnreadCount(
    activeConversation?.unread_count ?? activeConversation?.unreadCount
  );

  const { data: messagesResponse, isLoading: isMessagesLoading } =
    useAdminConversationMessages(activeConversation?.id, { per_page: 100 });

  useChatRealtime({
    role: "admin",
    conversationId: activeConversationId,
  });

  const messages = useMemo(
    () =>
      (messagesResponse?.data || [])
        .map((message) =>
          mapAdminMessageToChatMessage(message, getUserDisplayName(user))
        )
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [messagesResponse?.data, user]
  );

  useAutoMarkConversationRead({
    conversationId: activeConversationId,
    unreadCount: unreadMessageCount,
    onMarkRead: () => {
      if (activeConversationId) {
        markConversationRead(activeConversationId);
      }
    },
  });

  if (!resolvedUserId) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">Missing user id.</CardContent>
        </Card>
      </div>
    );
  }

  if (isUserLoading) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6 text-muted-foreground">Loading user...</CardContent>
        </Card>
      </div>
    );
  }

  if (isUserError || !user) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">
            {(userError as Error)?.message || "User not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      let conversationId = activeConversation?.id
        ? String(activeConversation.id)
        : undefined;

      if (!conversationId) {
        const created = await createConversationAsync(user.id!);
        conversationId = String(created.id);
      }

      await sendMessageAsync({
        conversationId,
        content,
      });
    } catch (sendError) {
      console.error("Failed to send admin message:", sendError);
    }
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
            <h1 className="text-2xl font-bold">Message {getUserDisplayName(user)}</h1>
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
              <p className="mt-1 font-semibold">{getUserDisplayName(user)}</p>
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
              <p className="mt-1 font-semibold">{getUserLocation(user)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Conversation
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeConversation
                  ? `Thread #${activeConversation.id}`
                  : "No previous thread found. Sending a message will open a new thread."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="min-h-[520px]">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId={currentUserId}
          />
          {isMessagesLoading || isCreatingConversation || isSendingMessage ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {isCreatingConversation
                ? "Opening conversation..."
                : isSendingMessage
                  ? "Sending message..."
                  : "Loading messages..."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
