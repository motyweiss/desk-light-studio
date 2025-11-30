import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}

export const SettingsSection = ({ icon: Icon, title, children }: SettingsSectionProps) => {
  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-[hsl(43_88%_60%)]" strokeWidth={1.5} />
        <h2 className="text-lg font-light text-white/90">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
