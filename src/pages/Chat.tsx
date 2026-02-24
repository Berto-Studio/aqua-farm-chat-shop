import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import CustomerServiceChat from "@/components/chat/CustomerServiceChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import {
  useMarkUserSupportConversationRead,
  useSendUserSupportMessage,
  useUserSupportConversation,
  useUserSupportMessages,
} from "@/hooks/useUserMessages";
import { mapAdminMessageToChatMessage } from "@/lib/adminTransformers";
import { useUserStore } from "@/store/store";
import { MessageCircle } from "lucide-react";

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const currentUserId = String(user?.id ?? "user-current");

  if (String(user?.user_type || "").toLowerCase() === "admin") {
    return <Navigate to="/admin/chat" replace />;
  }

  const [isOpen, setIsOpen] = useState(true);
  const { data: conversation } = useUserSupportConversation({
    enabled: isOpen,
  });
  const {
    data: messagesResponse,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
  } = useUserSupportMessages(
    { per_page: 100 },
    {
      enabled: isOpen,
    }
  );
  const { mutateAsync: sendSupportMessageAsync, isPending: isSendingMessage } =
    useSendUserSupportMessage();
  const { mutate: markConversationRead } = useMarkUserSupportConversationRead();

  const activeConversationId = conversation?.id ? String(conversation.id) : undefined;

  useChatRealtime({
    enabled: isOpen,
    role: "user",
    conversationId: activeConversationId,
  });

  const messages = useMemo(
    () =>
      (messagesResponse?.data || [])
        .map((message) => mapAdminMessageToChatMessage(message, "Customer Support"))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [messagesResponse?.data]
  );

  useEffect(() => {
    if (isOpen && activeConversationId) {
      markConversationRead();
    }
  }, [isOpen, markConversationRead, activeConversationId]);

  if (conversationId) {
    return <Navigate to="/chat" replace />;
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      await sendSupportMessageAsync(content.trim());
    } catch (sendError) {
      console.error("Failed to send support message:", sendError);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    navigate("/");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-3xl w-[95vw] h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b bg-white">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Customer Service
          </DialogTitle>
          <DialogDescription>
            You are connected directly to admin support.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[calc(85vh-5rem)] p-4 bg-slate-100/70">
          {isMessagesError ? (
            <div className="rounded-lg border bg-white p-4 text-sm text-destructive">
              {(messagesError as Error)?.message || "Failed to load messages."}
            </div>
          ) : (
            <CustomerServiceChat
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserId={currentUserId}
              supportName="Customer Support (Admin)"
            />
          )}
          {(isMessagesLoading || isSendingMessage) && (
            <p className="mt-2 text-xs text-muted-foreground">
              {isSendingMessage ? "Sending message..." : "Loading messages..."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
