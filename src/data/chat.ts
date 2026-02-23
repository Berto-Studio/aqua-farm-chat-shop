import { ChatConversation } from "@/types/chat";

const supportConversation: ChatConversation = {
  id: "support-admin-thread",
  userId: "admin",
  userName: "Customer Support",
  lastMessageTime: new Date("2026-02-23T09:30:00"),
  unreadCount: 1,
  messages: [
    {
      id: "msg-1",
      senderId: "admin",
      receiverId: "user-current",
      content:
        "Welcome to customer support. Share your order number and we will help right away.",
      timestamp: new Date("2026-02-23T09:00:00"),
      isRead: true,
      senderName: "Customer Support",
    },
    {
      id: "msg-2",
      senderId: "user-current",
      receiverId: "admin",
      content: "I want to confirm if my shipment is arriving tomorrow.",
      timestamp: new Date("2026-02-23T09:21:00"),
      isRead: true,
      senderName: "You",
    },
    {
      id: "msg-3",
      senderId: "admin",
      receiverId: "user-current",
      content:
        "Please share your order ID and we will check the latest delivery status.",
      timestamp: new Date("2026-02-23T09:30:00"),
      isRead: false,
      senderName: "Customer Support",
    },
  ],
};

// User-facing chat has a single support/admin thread.
export const mockConversations: ChatConversation[] = [supportConversation];

export const getConversationById = (id: string) =>
  mockConversations.find((conversation) => conversation.id === id);

export const getAllConversations = () => mockConversations;

export const getSupportConversation = () => supportConversation;
