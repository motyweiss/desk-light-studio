import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  iconClassName?: string;
}

export const SettingsSection = ({ icon: Icon, title, children, iconClassName }: SettingsSectionProps) => {
  return (
    <div className="bg-secondary/30 backdrop-blur-xl border border-border/30 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Icon className={iconClassName || "w-5 h-5 text-warm-glow"} strokeWidth={1.5} />
        <h2 className="text-lg font-light text-foreground/90">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
