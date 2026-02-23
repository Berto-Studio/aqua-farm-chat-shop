import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import CustomerServiceChat from "@/components/chat/CustomerServiceChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getSupportConversation } from "@/data/chat";
import { ChatMessage } from "@/types/chat";
import { MessageCircle } from "lucide-react";

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const supportConversation = getSupportConversation();

  if (conversationId && conversationId !== supportConversation.id) {
    return <Navigate to="/chat" replace />;
  }

  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(
    supportConversation.messages,
  );

  useEffect(() => {
    setMessages(supportConversation.messages);
  }, [supportConversation.messages]);

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "user-current",
      receiverId: "admin",
      content,
      timestamp: new Date(),
      isRead: false,
      senderName: "You",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Simulate admin response after a delay
    setTimeout(() => {
      const adminResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: "admin",
        receiverId: "user-current",
        content:
          "Thank you for your message. Our team will get back to you shortly.",
        timestamp: new Date(),
        isRead: true,
        senderName: "Customer Support",
      };

      setMessages((prevMessages) => [...prevMessages, adminResponse]);
    }, 1000);
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
          <CustomerServiceChat
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId="user-current"
            supportName="Customer Support (Admin)"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
