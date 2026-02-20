import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminNotificationType = "order" | "message" | "system";

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  type: AdminNotificationType;
  href?: string;
  createdAt: string;
  read: boolean;
}

type NewNotification = Omit<AdminNotification, "id" | "createdAt" | "read"> &
  Partial<Pick<AdminNotification, "createdAt" | "read">>;

type AdminNotificationState = {
  notifications: AdminNotification[];
  addNotification: (notification: NewNotification) => void;
  markAsRead: (id: string) => void;
  markTypeAsRead: (type: AdminNotificationType) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  resetNotifications: () => void;
};

const createNotificationId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const buildDefaultNotifications = (): AdminNotification[] => {
  const now = Date.now();

  return [
    {
      id: "notif-order-1",
      title: "New order received",
      description: "Order #ORD-7843 has been placed and needs confirmation.",
      type: "order",
      href: "/admin/orders",
      createdAt: new Date(now - 2 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "notif-message-1",
      title: "New user message",
      description: "A buyer asked about delivery timelines for fresh tilapia.",
      type: "message",
      href: "/admin/chat",
      createdAt: new Date(now - 7 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "notif-system-1",
      title: "Inventory alert",
      description: "Catfish fingerlings stock is running low.",
      type: "system",
      href: "/admin/products",
      createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
      read: false,
    },
  ];
};

export const useAdminNotificationStore = create<AdminNotificationState>()(
  persist(
    (set) => ({
      notifications: buildDefaultNotifications(),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              id: createNotificationId(),
              createdAt: notification.createdAt || new Date().toISOString(),
              read: notification.read ?? false,
              title: notification.title,
              description: notification.description,
              type: notification.type,
              href: notification.href,
            },
            ...state.notifications,
          ],
        })),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          ),
        })),
      markTypeAsRead: (type) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.type === type
              ? { ...notification, read: true }
              : notification
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),
      clearNotifications: () => set({ notifications: [] }),
      resetNotifications: () => set({ notifications: buildDefaultNotifications() }),
    }),
    {
      name: "admin-notifications-storage",
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
