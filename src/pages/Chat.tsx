import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import ChatInterface from "@/components/chat/ChatInterface";
import ChatList from "@/components/chat/ChatList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { getConversationById, getAllConversations } from "@/data/chat";
import { ChatMessage } from "@/types/chat";
import { MessageCircle, X } from "lucide-react";

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const allConversations = getAllConversations();
  const conversation = conversationId
    ? getConversationById(conversationId)
    : allConversations[0];

  // Redirect if conversation not found
  if (conversationId && !conversation) {
    return <Navigate to="/chat" replace />;
  }

  const [messages, setMessages] = useState<ChatMessage[]>(
    conversation ? conversation.messages : []
  );

  const handleSendMessage = (content: string) => {
    if (!conversation) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "user-current",
      receiverId: "admin",
      content,
      timestamp: new Date(),
      isRead: false,
      senderName: "You",
    };

    setMessages([...messages, newMessage]);

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
        senderName: "Admin",
      };

      setMessages((prevMessages) => [...prevMessages, adminResponse]);
    }, 1000);
  };

  const handleClose = () => {
    setIsOpen(false);
    navigate("/");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Customer Support
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-full p-4 pt-0 gap-4">
          <div className="w-full md:w-1/3 h-48 md:h-full">
            <ChatList
              conversations={allConversations}
              activeConversationId={conversation?.id}
            />
          </div>

          <div className="flex-1 h-64 md:h-full">
            {conversation ? (
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserId="user-current"
              />
            ) : (
              <div className="h-full border rounded-lg flex flex-col items-center justify-center p-6 bg-white">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Start a New Conversation
                  </h3>
                  <p className="text-muted-foreground">
                    Need help with your order or have questions about our
                    products?
                  </p>
                </div>
                <Button>New Conversation</Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
