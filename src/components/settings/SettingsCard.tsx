import { ReactNode } from "react";

interface SettingsCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

const SettingsCard = ({ title, description, action, children }: SettingsCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default SettingsCard;
