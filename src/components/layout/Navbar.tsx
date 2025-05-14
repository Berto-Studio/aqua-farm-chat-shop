
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Menu, X, MessageCircle, User } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  
  const NavLinks = () => (
    <div className="flex gap-4 items-center">
      <Link to="/" className="font-medium hover:text-primary transition-colors">
        Home
      </Link>
      <Link to="/products" className="font-medium hover:text-primary transition-colors">
        Products
      </Link>
      <Link to="/about" className="font-medium hover:text-primary transition-colors">
        About Us
      </Link>
      <Link to="/contact" className="font-medium hover:text-primary transition-colors">
        Contact
      </Link>
    </div>
  );

  return (
    <header className="bg-white border-b sticky top-0 z-40">
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
                      <Link to="/" className="font-medium text-lg">Home</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/products" className="font-medium text-lg">Products</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/about" className="font-medium text-lg">About Us</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/contact" className="font-medium text-lg">Contact</Link>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">FS</div>
              <span className="font-bold text-xl hidden sm:inline-block">FishFarm</span>
            </Link>
            
            {!isMobile && <NavLinks />}
          </div>
          
          <div className="flex items-center gap-3">
            {!isMobile && (
              <div className="relative w-[200px] lg:w-[300px]">
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            
            <Link to="/chat">
              <Button variant="ghost" size="icon" className="relative">
                <MessageCircle className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  2
                </Badge>
              </Button>
            </Link>
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>
            </Link>
            
            <Link to="/account">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
        
        {isMobile && (
          <div className="mt-3 mb-1">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>
    </header>
  );
}
