import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ChartBar,
  ChevronUp,
  Home,
  House,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/store";
import { logoutUser } from "@/services/auth/logout";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavLink({ to, icon, label, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-primary/10"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function AdminSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  
  const navItems = [
    {
      to: "/admin",
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      to: "/admin/products",
      icon: <Package className="h-5 w-5" />,
      label: "Products",
    },
    {
      to: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Orders",
    },
    {
      to: "/admin/services",
      icon: <Wrench className="h-5 w-5" />,
      label: "Services",
    },
    {
      to: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      label: "Users",
    },
    {
      to: "/admin/analytics",
      icon: <ChartBar className="h-5 w-5" />,
      label: "Analytics",
    },
  ];

  const userInitials = useMemo(() => {
    if (!user?.full_name && !user?.email) return "A";

    if (user?.full_name) {
      return user.full_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
    }

    return user?.email?.charAt(0).toUpperCase() || "A";
  }, [user?.email, user?.full_name]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-full w-64 border-r bg-white p-4 flex flex-col gap-6">
      <div className="flex items-center gap-2 px-2">
        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
          FS
        </div>
        <div>
          <div className="font-bold text-lg">FishFarm</div>
          <div className="text-xs text-muted-foreground">Admin Dashboard</div>
        </div>
      </div>
      
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={
              item.to === "/admin" 
                ? pathname === "/admin" 
                : pathname.startsWith(item.to) ||
                  (item.to === "/admin/users" &&
                    pathname.startsWith("/admin/customers"))
            }
          />
        ))}
      </nav>
      
      <div className="border-t pt-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-between px-3 py-2"
            >
              <div className="flex items-center gap-3 text-left">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image_url} alt={user?.full_name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">
                    {user?.full_name || "Admin User"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email || "admin@fishfarm.com"}
                  </div>
                </div>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/">
                <House className="mr-2 h-4 w-4" />
                Home
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
