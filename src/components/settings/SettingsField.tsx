import { ReactNode } from "react";

interface SettingsFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
}

export const SettingsField = ({ label, description, children }: SettingsFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-light text-white/60 tracking-wide">{label}</label>
      {children}
      {description && (
        <p className="text-xs text-white/40 font-light">{description}</p>
      )}
    </div>
  );
};
