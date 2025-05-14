
import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import ChatInterface from "@/components/chat/ChatInterface";
import ChatList from "@/components/chat/ChatList";
import { Button } from "@/components/ui/button";
import { getConversationById, getAllConversations } from "@/data/chat";
import { ChatMessage } from "@/types/chat";

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
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
      senderId: "user-current", // Current user is sending
      receiverId: "admin",
      content,
      timestamp: new Date(),
      isRead: false,
      senderName: "You"
    };
    
    setMessages([...messages, newMessage]);
    
    // Simulate admin response after a delay
    setTimeout(() => {
      const adminResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: "admin",
        receiverId: "user-current",
        content: "Thank you for your message. Our team will get back to you shortly.",
        timestamp: new Date(),
        isRead: true,
        senderName: "Admin"
      };
      
      setMessages(prevMessages => [...prevMessages, adminResponse]);
    }, 1000);
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Customer Support</h1>
        <p className="text-muted-foreground">Chat with our support team for assistance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        <div className="md:col-span-1">
          <ChatList 
            conversations={allConversations}
            activeConversationId={conversation?.id}
          />
        </div>
        
        <div className="md:col-span-2">
          {conversation ? (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserId="user-current"
            />
          ) : (
            <div className="h-full border rounded-lg flex flex-col items-center justify-center p-6 bg-white">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Start a New Conversation</h3>
                <p className="text-muted-foreground">
                  Need help with your order or have questions about our products?
                </p>
              </div>
              <Button>New Conversation</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
