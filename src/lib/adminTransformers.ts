import {
  AdminConversationRecord,
  AdminMessageRecord,
  AdminNotificationRecord,
  AdminOrderItemRecord,
  AdminOrderRecord,
  AdminUserRecord,
} from "@/types/admin";
import { ChatConversation, ChatMessage } from "@/types/chat";
import { formatPaymentMethodLabel, getRawPaymentMethod } from "@/lib/paymentUtils";

const toIsoDate = (value?: string) => {
  if (!value) return new Date().toISOString();

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
};

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getUserDisplayName = (user?: AdminUserRecord) =>
  user?.full_name ||
  user?.name ||
  (user?.email ? user.email.split("@")[0] : "User");

export const getUserLocation = (user?: AdminUserRecord) =>
  user?.location || user?.address || "N/A";

export const isUserActive = (user?: AdminUserRecord) => {
  if (!user) return false;
  if (typeof user.is_active === "boolean") return user.is_active;
  return String(user.status || "").toLowerCase() === "active";
};

export const getUserStatusLabel = (user?: AdminUserRecord) =>
  isUserActive(user) ? "Active" : "Inactive";

export const getUserOrderCount = (user?: AdminUserRecord) =>
  toFiniteNumber(user?.orders_count ?? user?.orders);

export const getUserTotalSpent = (user?: AdminUserRecord) =>
  toFiniteNumber(user?.total_spent ?? user?.amount_spent);

export const getUserJoinedAt = (user?: AdminUserRecord) =>
  user?.created_at || user?.updated_at || undefined;

export const getOrderTotal = (order?: AdminOrderRecord) =>
  toFiniteNumber(order?.total_price ?? order?.total);

export const getOrderStatusLabel = (order?: AdminOrderRecord) =>
  order?.status || "Unknown";

export const getOrderPaymentLabel = (order?: AdminOrderRecord) =>
  formatPaymentMethodLabel(getRawPaymentMethod(order));

export const getOrderShippingAddress = (order?: AdminOrderRecord) =>
  order?.shipping_address || order?.shippingAddress || "N/A";

export const getOrderUserName = (order?: AdminOrderRecord) =>
  order?.user_name || getUserDisplayName(order?.user);

export const getOrderItemsCount = (order?: AdminOrderRecord) =>
  Array.isArray(order?.items)
    ? order!.items!.reduce(
        (sum, item) => sum + toFiniteNumber(item.quantity, 0),
        0,
      )
    : 0;

export const getOrderItemName = (item?: AdminOrderItemRecord) =>
  item?.product_name || item?.name || "Item";

export const getOrderItemUnitPrice = (item?: AdminOrderItemRecord) =>
  toFiniteNumber(item?.unit_price);

export const mapAdminConversationToChatConversation = (
  conversation: AdminConversationRecord,
): ChatConversation => {
  const latestMessageContent =
    conversation.latest_message || conversation.latestMessage || "";

  return {
    id: String(conversation.id),
    userId: String(conversation.user_id),
    userName: conversation.user_name || conversation.user_email || "User",
    lastMessageTime: new Date(
      toIsoDate(conversation.last_message_at || conversation.lastMessageAt),
    ),
    unreadCount: toFiniteNumber(
      conversation.unread_count ?? conversation.unreadCount,
    ),
    messages: latestMessageContent
      ? [
          {
            id: `preview-${conversation.id}`,
            senderId: String(conversation.user_id),
            receiverId: "admin",
            content: latestMessageContent,
            timestamp: new Date(
              toIsoDate(
                conversation.last_message_at || conversation.lastMessageAt,
              ),
            ),
            isRead:
              toFiniteNumber(
                conversation.unread_count ?? conversation.unreadCount,
              ) === 0,
            senderName: conversation.user_name || "User",
          },
        ]
      : [],
  };
};

export const mapAdminMessageToChatMessage = (
  message: AdminMessageRecord,
  fallbackSenderName?: string,
): ChatMessage => ({
  id: String(message.id),
  senderId: String(message.sender_id),
  receiverId: String(message.receiver_id),
  content: message.content,
  timestamp: new Date(toIsoDate(message.created_at)),
  isRead: Boolean(message.is_read),
  senderName: message.sender_name || fallbackSenderName || "User",
});

export type NormalizedAdminNotification = {
  id: string;
  type: "order" | "message" | "system";
  title: string;
  description: string;
  href?: string;
  createdAt: string;
  read: boolean;
};

export const normalizeAdminNotification = (
  notification: AdminNotificationRecord,
): NormalizedAdminNotification => ({
  id: String(notification.id),
  type: notification.type || "system",
  title: notification.title,
  description: notification.description,
  href: notification.href,
  createdAt: toIsoDate(notification.createdAt || notification.created_at),
  read: Boolean(notification.read),
});
