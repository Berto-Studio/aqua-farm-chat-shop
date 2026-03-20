import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingCart, Menu, MessageCircle, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import SearchDropdown from "./SearchDropdown";
import CustomerServiceChat from "@/components/chat/CustomerServiceChat";
import {
  useMarkUserSupportConversationRead,
  useSendUserSupportMessage,
  useUserSupportConversation,
  useUserSupportMessages,
} from "@/hooks/useUserMessages";
import {
  toUnreadCount,
  useAutoMarkConversationRead,
} from "@/hooks/useAutoMarkConversationRead";
import { mapAdminMessageToChatMessage } from "@/lib/adminTransformers";
import { useUserStore } from "@/store/store";
import { useCarts } from "@/hooks/useCart";
import { logoutUser } from "@/services/auth/logout";
import { useChatRealtime } from "@/hooks/useChatRealtime";

export default function Navbar() {
  const isMobile = useIsMobile();
  const pathname = useLocation().pathname;
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Zustand store for user and login state
  const { user, isLoggedIn, isLoading } = useUserStore();
  const currentUserId = String(user?.id ?? "user-current");
  const isConsumerUser = Boolean(isLoggedIn && user?.user_type !== "admin");
  const isDedicatedChatRoute = pathname.startsWith("/chat");
  const { data: supportConversation } = useUserSupportConversation({
    enabled: isConsumerUser,
  });
  const {
    data: messagesResponse,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
  } = useUserSupportMessages(
    { per_page: 100 },
    {
      enabled: isConsumerUser && isChatOpen,
    },
  );
  const { mutateAsync: sendSupportMessageAsync, isPending: isSendingMessage } =
    useSendUserSupportMessage();
  const { mutate: markConversationRead } = useMarkUserSupportConversationRead();

  const activeConversationId = supportConversation?.id
    ? String(supportConversation.id)
    : undefined;
  const unreadMessages = toUnreadCount(
    supportConversation?.unread_count ?? supportConversation?.unreadCount
  );
  const messages = useMemo(
    () =>
      (messagesResponse?.data || [])
        .map((message) =>
          mapAdminMessageToChatMessage(message, "Customer Support"),
        )
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [messagesResponse?.data],
  );
  useAutoMarkConversationRead({
    enabled: isConsumerUser && isChatOpen,
    conversationId: activeConversationId,
    unreadCount: unreadMessages,
    onMarkRead: () => markConversationRead(),
  });

  useChatRealtime({
    enabled: isConsumerUser && !isDedicatedChatRoute,
    role: "user",
    conversationId: activeConversationId,
  });

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      await sendSupportMessageAsync(content.trim());
    } catch (sendError) {
      console.error("Failed to send support message:", sendError);
    }
  };

  const NavLinks = () => (
    <div className="flex gap-4 items-center">
      <Link
        to="/products"
        className="font-medium hover:text-primary transition-colors"
      >
        Products
      </Link>
      <Link
        to="/services"
        className="font-medium hover:text-primary transition-colors"
      >
        Services
      </Link>
      <Link
        to="/about"
        className="font-medium hover:text-primary transition-colors"
      >
        About Us
      </Link>
      <Link
        to="/contact"
        className="font-medium hover:text-primary transition-colors"
      >
        Contact
      </Link>
    </div>
  );
  const { totalCartItems } = useCarts({ enabled: isLoggedIn });

  const cartCount = isLoggedIn ? totalCartItems : 0;

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/login";
  };

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                    <div className="flex flex-col gap-6 mt-6">
                      <SheetClose asChild>
                        <Link to="/products" className="font-medium text-lg">
                          Products
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/services" className="font-medium text-lg">
                          Services
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/about" className="font-medium text-lg">
                          About Us
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/contact" className="font-medium text-lg">
                          Contact
                        </Link>
                      </SheetClose>
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              <Link to="/" className="flex items-center gap-2">
                <img src="/logo/logo1.png" alt="" className="w-16 h-13" />
              </Link>

              {!isMobile && <NavLinks />}
            </div>

            <div className="flex items-center gap-3">
              {!isMobile && (
                <div className="relative w-[200px] lg:w-[300px]">
                  <SearchDropdown />
                </div>
              )}

              {isLoggedIn && (
                <div className="flex items-center gap-2">
                  {user?.user_type !== "admin" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={() => setIsChatOpen(true)}
                        aria-label="Open messages"
                      >
                        <MessageCircle className="h-5 w-5" />
                        {unreadMessages > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs">
                            {unreadMessages}
                          </Badge>
                        )}
                      </Button>
                    </>
                  )}

                  <Link to="/cart">
                    <Button variant="ghost" size="icon" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {cartCount}
                      </Badge>
                    </Button>
                  </Link>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {isLoggedIn ? (
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                      disabled={isLoading}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.image_url}
                          alt={user?.full_name}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.email
                            ? user.email.charAt(0).toUpperCase() +
                              user.email.split("@")[0].slice(-1).toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <User className="h-5 w-5" />
                    </Button>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-background border-border"
                >
                  {isLoggedIn ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>{user?.full_name || "Profile"}</span>
                        </Link>
                      </DropdownMenuItem>
                      {user?.user_type === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link
                            to={user?.is_admin ? "/admin" : "/farmer-dashboard"}
                            className="cursor-pointer"
                          >
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer"
                      >
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/login" className="cursor-pointer">
                          Login
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/register" className="cursor-pointer">
                          Register
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isMobile && (
            <div className="mt-3 mb-1">
              <SearchDropdown />
            </div>
          )}
        </div>
      </header>

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent
          className={`
          ${
            isMobile
              ? "w-[100vw] h-[100vh] max-w-none max-h-none m-0 rounded-none"
              : "w-[92vw] h-[84vh] max-w-4xl max-h-[760px]"
          } 
          p-0 overflow-hidden
        `}
        >
          <DialogHeader className="p-4 pb-2 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Customer Service
            </DialogTitle>
            <DialogDescription>
              You are connected directly to admin support.
            </DialogDescription>
          </DialogHeader>

          <div
            className={`
            p-4 bg-slate-100/70
            ${isMobile ? "h-[calc(100vh-5rem)]" : "h-[calc(84vh-4.5rem)]"}
          `}
          >
            {isMessagesError ? (
              <div className="rounded-lg border bg-white p-4 text-sm text-destructive">
                {(messagesError as Error)?.message ||
                  "Failed to load messages."}
              </div>
            ) : (
              <CustomerServiceChat
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserId={currentUserId}
                supportName="Customer Support (Admin)"
              />
            )}
            {(isMessagesLoading || isSendingMessage) && (
              <p className="mt-2 text-xs text-muted-foreground">
                {isSendingMessage
                  ? "Sending message..."
                  : "Loading messages..."}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
