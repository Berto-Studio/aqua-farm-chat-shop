import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import ChatInterface from "@/components/chat/ChatInterface";
import ChatList from "@/components/chat/ChatList";
import {
  useAdminConversationMessages,
  useAdminConversations,
  useMarkAdminConversationRead,
  useSendAdminConversationMessage,
} from "@/hooks/useAdminMessages";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import {
  mapAdminConversationToChatConversation,
  mapAdminMessageToChatMessage,
} from "@/lib/adminTransformers";
import { useUserStore } from "@/store/store";

export default function AdminChat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const user = useUserStore((state) => state.user);
  const currentUserId = String(user?.id ?? "admin");

  const {
    data: conversationResponse,
    isLoading: isConversationsLoading,
    isError: isConversationsError,
    error: conversationsError,
  } = useAdminConversations();
  const { mutate: sendMessage, isPending: isSendingMessage } =
    useSendAdminConversationMessage();
  const { mutate: markConversationRead } = useMarkAdminConversationRead();

  const allConversations = useMemo(
    () =>
      (conversationResponse?.data || [])
        .map(mapAdminConversationToChatConversation)
        .sort(
          (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime(),
        ),
    [conversationResponse?.data],
  );

  const activeConversation = useMemo(() => {
    if (conversationId) {
      return allConversations.find(
        (conversation) => conversation.id === conversationId,
      );
    }
    return allConversations[0];
  }, [allConversations, conversationId]);

  const activeConversationId = activeConversation?.id;

  const { data: messagesResponse, isLoading: isMessagesLoading } =
    useAdminConversationMessages(activeConversationId, { per_page: 100 });

  useChatRealtime({
    role: "admin",
    conversationId: activeConversationId,
  });

  const messages = useMemo(
    () =>
      (messagesResponse?.data || [])
        .map((message) =>
          mapAdminMessageToChatMessage(message, activeConversation?.userName),
        )
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [activeConversation?.userName, messagesResponse?.data],
  );

  useEffect(() => {
    if (activeConversationId) {
      markConversationRead(activeConversationId);
    }
  }, [activeConversationId, markConversationRead]);

  if (conversationId && !isConversationsLoading && !activeConversation) {
    return <Navigate to="/admin/chat" replace />;
  }

  const handleSendMessage = (content: string) => {
    if (!activeConversationId || !content.trim()) return;

    sendMessage({
      conversationId: activeConversationId,
      content,
    });
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold">User Messages</h1>
        <p className="text-muted-foreground">Respond to user inquiries</p>
      </div>

      {isConversationsError ? (
        <div className="shrink-0 rounded-lg border p-6 text-destructive">
          {(conversationsError as Error)?.message ||
            "Failed to load conversations."}
        </div>
      ) : null}

      <div className="flex flex-col gap-6 md:min-h-0 md:flex-1 md:grid md:grid-cols-3 md:overflow-hidden">
        <div className="min-h-[18rem] md:col-span-1 md:min-h-0">
          <ChatList
            conversations={allConversations}
            activeConversationId={activeConversation?.id}
            basePath="/admin/chat"
          />
        </div>

        <div className="flex min-h-[24rem] flex-col md:col-span-2 md:min-h-0">
          {activeConversation ? (
            <div className="min-h-0 flex-1">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserId={currentUserId}
              />
            </div>
          ) : (
            <div className="flex min-h-[24rem] flex-1 flex-col items-center justify-center rounded-lg border bg-white p-6 md:min-h-0">
              <p className="text-center text-muted-foreground">
                {isConversationsLoading
                  ? "Loading conversations..."
                  : "Select a conversation to respond to user messages"}
              </p>
            </div>
          )}
          {(isMessagesLoading || isSendingMessage) && activeConversation ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {isSendingMessage
                ? "Sending message..."
                : "Refreshing messages..."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
