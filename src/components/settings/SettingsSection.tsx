import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  iconClassName?: string;
  delay?: number;
}

export const SettingsSection = ({ icon: Icon, title, children, iconClassName, delay = 0 }: SettingsSectionProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-500"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-warm-glow/10 flex items-center justify-center">
          <Icon className={iconClassName || "w-[18px] h-[18px] text-warm-glow"} strokeWidth={1.5} />
        </div>
        <h2 className="text-base font-light text-white/90 tracking-wide">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
};
