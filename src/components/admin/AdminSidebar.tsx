
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  MessageCircle, 
  Settings,
  ChartBar
} from "lucide-react";

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
      to: "/admin/customers",
      icon: <Users className="h-5 w-5" />,
      label: "Customers",
    },
    {
      to: "/admin/chat",
      icon: <MessageCircle className="h-5 w-5" />,
      label: "Messages",
    },
    {
      to: "/admin/analytics",
      icon: <ChartBar className="h-5 w-5" />,
      label: "Analytics",
    },
    {
      to: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
    },
  ];

  return (
    <div className="border-r h-full bg-white p-4 w-64 flex flex-col gap-6">
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
                : pathname.startsWith(item.to)
            }
          />
        ))}
      </nav>
      
      <div className="border-t pt-3">
        <div className="flex items-center gap-3 px-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            A
          </div>
          <div>
            <div className="font-medium text-sm">Admin User</div>
            <div className="text-xs text-muted-foreground">admin@fishfarm.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
