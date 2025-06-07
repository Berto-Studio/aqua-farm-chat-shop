import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, MessageCircle, User } from "lucide-react";
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
import ChatInterface from "@/components/chat/ChatInterface";
import ChatList from "@/components/chat/ChatList";
import { getAllConversations } from "@/data/chat";
import { ChatMessage } from "@/types/chat";
import { useUserStore } from "@/store/store";

export default function Navbar() {
  const isMobile = useIsMobile();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Zustand store for user and login state
  const { user, isLoggedIn, isLoading, logout } = useUserStore();

  const allConversations = getAllConversations();
  const conversation = allConversations[0];

  // Initialize messages when conversation changes
  useEffect(() => {
    if (conversation && messages.length === 0) {
      setMessages(conversation.messages);
    }
  }, [conversation, messages.length]);

  const handleSendMessage = (content: string) => {
    if (!conversation) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "user-current",
      receiverId: "admin",
      content,
      timestamp: new Date(),
      isRead: false,
      senderName: "You",
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate admin response after a delay
    setTimeout(() => {
      const adminResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: "admin",
        receiverId: "user-current",
        content:
          "Thank you for your message. Our team will get back to you shortly.",
        timestamp: new Date(),
        isRead: true,
        senderName: "Admin",
      };

      setMessages(prev => [...prev, adminResponse]);
    }, 1000);
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
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  FS
                </div>
                <span className="font-bold text-xl hidden sm:inline-block text-foreground">
                  FishFarm
                </span>
              </Link>

              {!isMobile && <NavLinks />}
            </div>

            <div className="flex items-center gap-3">
              {!isMobile && (
                <div className="relative w-[200px] lg:w-[300px]">
                  <SearchDropdown />
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageCircle className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  2
                </Badge>
              </Button>

              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    3
                  </Badge>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isLoading}>
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border-border">
                  {isLoggedIn ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>{user?.name || "Profile"}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          logout();
                          window.location.href = "/login";
                        }}
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
              : "w-[90vw] h-[85vh] max-w-5xl max-h-[700px]"
          } 
          p-0 overflow-y-scroll
        `}
        >
          <DialogHeader className="p-4 pb-2 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Customer Support
            </DialogTitle>
            <DialogDescription>
              Chat with our support team for help with your orders and questions
            </DialogDescription>
          </DialogHeader>

          <div
            className={`
            flex h-full p-4 pt-0 gap-4 
            ${isMobile ? "flex-col" : "flex-row"}
          `}
          >
            <div
              className={`
              ${isMobile ? "w-full h-[200px] flex-shrink-0" : "w-1/3 h-full"}
            `}
            >
              <ChatList
                conversations={allConversations}
                activeConversationId={conversation?.id}
              />
            </div>

            <div
              className={`
                
              ${isMobile ? "h-[65vh] min-h-0" : "h-[60vh]"}
            `}
            >
              {conversation ? (
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentUserId="user-current"
                />
              ) : (
                <div className="h-full border rounded-lg flex flex-col items-center justify-center p-6 bg-background">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Start a New Conversation
                    </h3>
                    <p className="text-muted-foreground">
                      Need help with your order or have questions about our
                      products?
                    </p>
                  </div>
                  <Button>New Conversation</Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
