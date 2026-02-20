
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import ChatInterface from "@/components/chat/ChatInterface";
import ChatList from "@/components/chat/ChatList";
import { getConversationById, getAllConversations } from "@/data/chat";
import { ChatMessage } from "@/types/chat";

export default function AdminChat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const allConversations = getAllConversations();
  const conversation = conversationId 
    ? getConversationById(conversationId) 
    : allConversations[0];
  
  // Redirect if conversation not found and ID provided
  if (conversationId && !conversation) {
    return <Navigate to="/admin/chat" replace />;
  }

  const [messages, setMessages] = useState<ChatMessage[]>(
    conversation ? conversation.messages : []
  );

  useEffect(() => {
    setMessages(conversation ? conversation.messages : []);
  }, [conversationId]);

  const handleSendMessage = (content: string) => {
    if (!conversation) return;
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "admin", // Admin is sending
      receiverId: conversation.userId,
      content,
      timestamp: new Date(),
      isRead: false,
      senderName: "Admin"
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Customer Messages</h1>
        <p className="text-muted-foreground">Respond to customer inquiries</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        <div className="md:col-span-1">
          <ChatList 
            conversations={allConversations}
            activeConversationId={conversation?.id}
            basePath="/admin/chat"
          />
        </div>
        
        <div className="md:col-span-2">
          {conversation ? (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserId="admin"
            />
          ) : (
            <div className="h-full border rounded-lg flex flex-col items-center justify-center p-6 bg-white">
              <p className="text-center text-muted-foreground">
                Select a conversation to respond to customer messages
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
