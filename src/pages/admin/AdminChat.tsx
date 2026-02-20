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
          (a, b) =>
            b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
        ),
    [conversationResponse?.data]
  );

  const activeConversation = useMemo(() => {
    if (conversationId) {
      return allConversations.find((conversation) => conversation.id === conversationId);
    }
    return allConversations[0];
  }, [allConversations, conversationId]);

  const activeConversationId = activeConversation?.id;

  const { data: messagesResponse, isLoading: isMessagesLoading } =
    useAdminConversationMessages(activeConversationId, { per_page: 100 });

  const messages = useMemo(
    () =>
      (messagesResponse?.data || [])
        .map((message) =>
          mapAdminMessageToChatMessage(message, activeConversation?.userName)
        )
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [activeConversation?.userName, messagesResponse?.data]
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Messages</h1>
        <p className="text-muted-foreground">Respond to user inquiries</p>
      </div>

      {isConversationsError ? (
        <div className="rounded-lg border p-6 text-destructive">
          {(conversationsError as Error)?.message ||
            "Failed to load conversations."}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        <div className="md:col-span-1">
          <ChatList
            conversations={allConversations}
            activeConversationId={activeConversation?.id}
            basePath="/admin/chat"
          />
        </div>

        <div className="md:col-span-2">
          {activeConversation ? (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserId={currentUserId}
            />
          ) : (
            <div className="h-full border rounded-lg flex flex-col items-center justify-center p-6 bg-white">
              <p className="text-center text-muted-foreground">
                {isConversationsLoading
                  ? "Loading conversations..."
                  : "Select a conversation to respond to user messages"}
              </p>
            </div>
          )}
          {(isMessagesLoading || isSendingMessage) && activeConversation ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {isSendingMessage ? "Sending message..." : "Refreshing messages..."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
