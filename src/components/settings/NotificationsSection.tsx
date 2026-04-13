import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import SettingsCard from "./SettingsCard";

interface NotifSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const defaultNotifs: { category: string; items: NotifSetting[] }[] = [
  {
    category: "Orders & Shipping",
    items: [
      { id: "order_confirm", label: "Order confirmations", description: "When a new order is placed", enabled: true },
      { id: "shipping_update", label: "Shipping updates", description: "Tracking and delivery status changes", enabled: true },
      { id: "order_return", label: "Returns & refunds", description: "When a return or refund is processed", enabled: false },
    ],
  },
  {
    category: "Marketing",
    items: [
      { id: "promotions", label: "Promotions & deals", description: "Special offers and seasonal discounts", enabled: false },
      { id: "newsletter", label: "Newsletter", description: "Weekly tips and product highlights", enabled: true },
      { id: "product_launches", label: "New arrivals", description: "When new products are added to the store", enabled: false },
    ],
  },
  {
    category: "Account",
    items: [
      { id: "security", label: "Security alerts", description: "Sign-in from new devices and password changes", enabled: true },
      { id: "account_updates", label: "Account updates", description: "Profile and billing changes", enabled: true },
    ],
  },
];

const NotificationsSection = () => {
  const [notifs, setNotifs] = useState(defaultNotifs);

  const toggle = (categoryIdx: number, itemIdx: number) => {
    setNotifs((prev) =>
      prev.map((cat, ci) =>
        ci === categoryIdx
          ? {
              ...cat,
              items: cat.items.map((item, ii) =>
                ii === itemIdx ? { ...item, enabled: !item.enabled } : item
              ),
            }
          : cat
      )
    );
  };

  return (
    <div className="space-y-6">
      {notifs.map((category, ci) => (
        <SettingsCard key={category.category} title={category.category}>
          <div className="divide-y divide-border">
            {category.items.map((item, ii) => (
              <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                    {item.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.enabled}
                  onCheckedChange={() => toggle(ci, ii)}
                />
              </div>
            ))}
          </div>
        </SettingsCard>
      ))}

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset Defaults</Button>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationsSection;
