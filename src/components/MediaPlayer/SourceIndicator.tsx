import { ServiceIcon } from '@/components/icons/ServiceIcons';

interface SourceIndicatorProps {
  appName: string | null;
}

export const SourceIndicator = ({ appName }: SourceIndicatorProps) => {
  if (!appName) return null;

  return (
    <div className="flex items-center gap-2 text-white/40">
      <ServiceIcon appName={appName} className="w-5 h-5" />
      <span className="text-xs font-light capitalize">{appName}</span>
    </div>
  );
};
