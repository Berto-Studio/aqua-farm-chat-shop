import { useEffect, useMemo } from "react";
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
import {
  AdminNotification,
  useAdminNotificationStore,
} from "@/store/adminNotifications";

type AdminHeaderProps = {
  showMenuButton?: boolean;
  onMenuToggle?: () => void;
};

const getHeaderTitle = (pathname: string) => {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/customers")) return "Customers";
  if (pathname.startsWith("/admin/analytics")) return "Analytics";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  if (pathname.startsWith("/admin/chat")) return "Messages";
  return "Admin";
};

const getNotificationTypeLabel = (notification: AdminNotification) => {
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

  const notifications = useAdminNotificationStore((state) => state.notifications);
  const markAsRead = useAdminNotificationStore((state) => state.markAsRead);
  const markTypeAsRead = useAdminNotificationStore((state) => state.markTypeAsRead);
  const markAllAsRead = useAdminNotificationStore((state) => state.markAllAsRead);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const unreadMessageCount = notifications.filter(
    (notification) => !notification.read && notification.type === "message"
  ).length;

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  useEffect(() => {
    if (pathname.startsWith("/admin/chat")) {
      markTypeAsRead("message");
    }
    if (pathname.startsWith("/admin/orders")) {
      markTypeAsRead("order");
    }
  }, [pathname, markTypeAsRead]);

  const handleNotificationClick = (notification: AdminNotification) => {
    markAsRead(notification.id);

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
            <DropdownMenuContent align="end" className="w-[340px] p-0">
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
                    onClick={markAllAsRead}
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
            variant={pathname.startsWith("/admin/chat") ? "default" : "ghost"}
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
