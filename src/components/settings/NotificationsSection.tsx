import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import SettingsCard from "./SettingsCard";
import {
  useResetSettingsNotifications,
  useSettingsNotifications,
  useUpdateSettingsNotifications,
} from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import type { NotificationGroup } from "@/types/settings";

const NotificationsSection = () => {
  const { toast } = useToast();
  const { data, isLoading, error, refetch } = useSettingsNotifications();
  const updateNotifications = useUpdateSettingsNotifications();
  const resetNotifications = useResetSettingsNotifications();
  const [notifs, setNotifs] = useState<NotificationGroup[]>([]);

  useEffect(() => {
    if (!data) return;
    setNotifs(data.groups || []);
  }, [data]);

  const toggle = (categoryIdx: number, itemIdx: number) => {
    setNotifs((prev) =>
      prev.map((group, ci) =>
        ci === categoryIdx
          ? {
              ...group,
              settings: group.settings.map((item, ii) =>
                ii === itemIdx ? { ...item, enabled: !item.enabled } : item
              ),
            }
          : group
      )
    );
  };

  const handleSavePreferences = async () => {
    const payload = Object.fromEntries(
      notifs.flatMap((group) =>
        group.settings.map((setting) => [setting.id, setting.enabled] as const)
      )
    );

    try {
      await updateNotifications.mutateAsync(payload);
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
        variant: "success",
      });
    } catch (mutationError) {
      toast({
        title: "Unable to save preferences",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleResetDefaults = async () => {
    try {
      await resetNotifications.mutateAsync();
      toast({
        title: "Defaults restored",
        description: "Your notification preferences are back to their defaults.",
        variant: "success",
      });
    } catch (mutationError) {
      toast({
        title: "Reset failed",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  if (isLoading && !data) {
    return (
      <SettingsCard title="Notification Preferences">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your notification preferences...
        </div>
      </SettingsCard>
    );
  }

  if (error && !data) {
    return (
      <SettingsCard title="Notification Preferences">
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "We couldn't load your notification preferences."}
        </p>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-6">
      {notifs.map((group, ci) => (
        <SettingsCard key={group.id} title={group.label}>
          <div className="divide-y divide-border">
            {group.settings.map((item, ii) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
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
                  disabled={updateNotifications.isPending || resetNotifications.isPending}
                />
              </div>
            ))}
          </div>
        </SettingsCard>
      ))}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleResetDefaults}
          disabled={resetNotifications.isPending || updateNotifications.isPending}
        >
          {resetNotifications.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Defaults"
          )}
        </Button>
        <Button
          type="button"
          onClick={handleSavePreferences}
          disabled={updateNotifications.isPending || resetNotifications.isPending}
        >
          {updateNotifications.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotificationsSection;
