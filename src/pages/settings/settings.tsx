import { useState } from "react";
import SettingsSidebar, {
  type SettingsSection,
} from "@/components/settings/SettingsSidebar";
import ProfileSection from "@/components/settings/ProfileSection";
import NotificationsSection from "@/components/settings/NotificationsSection";
import PaymentsSection from "@/components/settings/PaymentsSection";
import { Settings as SettingsIcon } from "lucide-react";

const sectionComponents: Record<SettingsSection, React.FC> = {
  profile: ProfileSection,
  notifications: NotificationsSection,
  payments: PaymentsSection,
};

const sectionTitles: Record<SettingsSection, string> = {
  profile: "Profile Settings",
  notifications: "Notification Preferences",
  payments: "Payment & Billing",
};

const Settings = () => {
  const [active, setActive] = useState<SettingsSection>("profile");
  const ActiveComponent = sectionComponents[active];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <SettingsIcon className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-display font-bold text-foreground">
              Settings
            </h1>
          </div>
          <p className="text-muted-foreground ml-9">
            Manage your account preferences and configuration.
          </p>
        </div>

        {/* Layout */}
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-56 shrink-0">
            <SettingsSidebar active={active} onChange={setActive} />
          </aside>
          <main className="flex-1 min-w-0">
            <h2 className="text-lg font-display font-semibold text-foreground mb-5">
              {sectionTitles[active]}
            </h2>
            <ActiveComponent />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
