import { User, Bell, CreditCard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsSection = "profile" | "notifications" | "payments";

interface SettingsSidebarProps {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

const items: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "payments", label: "Payments", icon: CreditCard },
];

const SettingsSidebar = ({ active, onChange }: SettingsSidebarProps) => {
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors text-left",
            active === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="flex-1">{label}</span>
          <ChevronRight className={cn("h-4 w-4 opacity-0 transition-opacity", active === id && "opacity-100")} />
        </button>
      ))}
    </nav>
  );
};

export default SettingsSidebar;
