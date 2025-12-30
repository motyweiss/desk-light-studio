import { ReactNode } from "react";

interface SettingsFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
}

export const SettingsField = ({ label, description, children }: SettingsFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-light text-foreground/60 tracking-wide">{label}</label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground font-light">{description}</p>
      )}
    </div>
  );
};
