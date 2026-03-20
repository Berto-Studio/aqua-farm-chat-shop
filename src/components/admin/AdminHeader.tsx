import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAdminConversations } from "@/hooks/useAdminMessages";
import {
  useAdminNotifications,
  useMarkAdminNotificationRead,
  useMarkAllAdminNotificationsRead,
} from "@/hooks/useAdminNotifications";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import { MarkAdminNotificationRead } from "@/services/admin/notifications";
import {
  NormalizedAdminNotification,
  normalizeAdminNotification,
} from "@/lib/adminTransformers";

type AdminHeaderProps = {
  showMenuButton?: boolean;
  onMenuToggle?: () => void;
};

const getUnreadValue = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getHeaderTitle = (pathname: string) => {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/customers")) return "Users";
  if (pathname.startsWith("/admin/analytics")) return "Analytics";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  if (pathname.startsWith("/admin/chat")) return "Messages";
  return "Admin";
};

const getNotificationTypeLabel = (notification: NormalizedAdminNotification) => {
  if (notification.type === "order") return "Order";
  if (notification.type === "message") return "Message";
  return "System";
};

export default function AdminHeader({
  showMenuButton = false,
  onMenuToggle,
}: AdminHeaderProps) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const lastAutoReadKeyRef = useRef<string | null>(null);
  const isAdminChatRoute = pathname.startsWith("/admin/chat");
  const isDirectMessageRoute =
    /^\/admin\/(?:users|customers)\/[^/]+\/message$/.test(pathname);
  const { data: notificationsResponse } = useAdminNotifications({ per_page: 100 });
  const { data: conversationsResponse } = useAdminConversations();
  const { mutate: markAsRead } = useMarkAdminNotificationRead();
  const { mutate: markAllAsRead } = useMarkAllAdminNotificationsRead();

  useChatRealtime({
    enabled: !(isAdminChatRoute || isDirectMessageRoute),
    role: "admin",
  });

  const notifications = useMemo(
    () => (notificationsResponse?.data || []).map(normalizeAdminNotification),
    [notificationsResponse?.data],
  );
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;
  const unreadMessageNotificationCount = notifications.filter(
    (notification) => !notification.read && notification.type === "message",
  ).length;
  const unreadConversationMessageCount = useMemo(() => {
    if (!conversationsResponse?.data) return null;

    return conversationsResponse.data.reduce(
      (total, conversation) =>
        total +
        getUnreadValue(conversation.unread_count ?? conversation.unreadCount),
      0,
    );
  }, [conversationsResponse?.data]);
  const unreadMessageCount =
    unreadConversationMessageCount ?? unreadMessageNotificationCount;
  const autoReadType = isAdminChatRoute || isDirectMessageRoute
    ? "message"
    : pathname.startsWith("/admin/orders")
      ? "order"
      : null;
  const autoReadNotificationIds = useMemo(() => {
    if (!autoReadType) return [];

    return notifications
      .filter(
        (notification) =>
          !notification.read && notification.type === autoReadType,
      )
      .map((notification) => notification.id)
      .sort();
  }, [autoReadType, notifications]);

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  useEffect(() => {
    if (!autoReadType || autoReadNotificationIds.length === 0) {
      lastAutoReadKeyRef.current = null;
      return;
    }

    const autoReadKey = `${autoReadType}:${autoReadNotificationIds.join(",")}`;
    if (lastAutoReadKeyRef.current === autoReadKey) {
      return;
    }

    lastAutoReadKeyRef.current = autoReadKey;
    let isCancelled = false;

    void (async () => {
      const results = await Promise.allSettled(
        autoReadNotificationIds.map((notificationId) =>
          MarkAdminNotificationRead(notificationId),
        ),
      );

      if (isCancelled) return;

      const hasUpdatedNotification = results.some(
        (result) => result.status === "fulfilled" && result.value.success,
      );

      if (hasUpdatedNotification) {
        queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [autoReadNotificationIds, autoReadType, queryClient]);

  const handleNotificationClick = (notification: NormalizedAdminNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.href) {
      navigate(notification.href);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <Button variant="ghost" size="icon" onClick={onMenuToggle}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
            <h1 className="text-lg font-semibold text-foreground">
              {getHeaderTitle(pathname)}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {Math.min(unreadCount, 99)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[calc(100vw-1rem)] max-w-[340px] p-0"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => markAllAsRead()}
                  >
                    <CheckCheck className="mr-1 h-3.5 w-3.5" />
                    Mark all read
                  </Button>
                )}
              </div>

              <div className="max-h-[320px] overflow-y-auto">
                {sortedNotifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  sortedNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p
                            className={cn(
                              "text-sm font-medium text-foreground",
                              !notification.read && "text-primary"
                            )}
                          >
                            {notification.title}
                          </p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {notification.description}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {getNotificationTypeLabel(notification)} |{" "}
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={isAdminChatRoute || isDirectMessageRoute ? "default" : "ghost"}
            size="icon"
            asChild
            className="relative"
          >
            <Link to="/admin/chat">
              <MessageCircle className="h-5 w-5" />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {Math.min(unreadMessageCount, 99)}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
