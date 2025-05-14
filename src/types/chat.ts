
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  senderName: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  userName: string;
  messages: ChatMessage[];
  lastMessageTime: Date;
  unreadCount: number;
}
