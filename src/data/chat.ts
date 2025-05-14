
import { ChatMessage, ChatConversation } from "@/types/chat";

// Mock chat data
export const mockConversations: ChatConversation[] = [
  {
    id: "conv-1",
    userId: "user-1",
    userName: "John Doe",
    lastMessageTime: new Date("2025-05-14T10:23:00"),
    unreadCount: 2,
    messages: [
      {
        id: "msg-1",
        senderId: "user-1",
        receiverId: "admin",
        content: "Hello, I'm interested in purchasing some catfish fingerlings. Do you ship to California?",
        timestamp: new Date("2025-05-14T10:20:00"),
        isRead: true,
        senderName: "John Doe"
      },
      {
        id: "msg-2",
        senderId: "admin",
        receiverId: "user-1",
        content: "Hi John, yes we do ship to California! Our shipping typically takes 1-2 business days depending on your location.",
        timestamp: new Date("2025-05-14T10:22:00"),
        isRead: true,
        senderName: "Admin"
      },
      {
        id: "msg-3",
        senderId: "user-1",
        receiverId: "admin",
        content: "Great! What's the minimum order quantity?",
        timestamp: new Date("2025-05-14T10:23:00"),
        isRead: false,
        senderName: "John Doe"
      }
    ]
  },
  {
    id: "conv-2",
    userId: "user-2",
    userName: "Sarah Smith",
    lastMessageTime: new Date("2025-05-14T09:45:00"),
    unreadCount: 1,
    messages: [
      {
        id: "msg-4",
        senderId: "user-2",
        receiverId: "admin",
        content: "Hi there, I received my order of tilapia but one of the fish looks unhealthy. Can you help?",
        timestamp: new Date("2025-05-14T09:40:00"),
        isRead: true,
        senderName: "Sarah Smith"
      },
      {
        id: "msg-5",
        senderId: "admin",
        receiverId: "user-2",
        content: "I'm sorry to hear that. Could you please send a photo so we can assess the situation better?",
        timestamp: new Date("2025-05-14T09:43:00"),
        isRead: true,
        senderName: "Admin"
      },
      {
        id: "msg-6",
        senderId: "user-2",
        receiverId: "admin",
        content: "Here's a photo of the fish [image attached]",
        timestamp: new Date("2025-05-14T09:45:00"),
        isRead: false,
        senderName: "Sarah Smith"
      }
    ]
  }
];

export const getConversationById = (id: string) => 
  mockConversations.find(conversation => conversation.id === id);

export const getAllConversations = () => mockConversations;
