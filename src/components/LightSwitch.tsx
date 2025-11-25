import { motion } from "framer-motion";

interface LightSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  isMaster?: boolean;
}

export const LightSwitch = ({ label, checked, onChange, isMaster = false }: LightSwitchProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-20 h-10 rounded-full transition-all duration-300 ${
          checked 
            ? 'bg-gradient-to-r from-warm-glow to-accent shadow-[0_0_20px_rgba(251,191,36,0.5)]' 
            : 'bg-secondary'
        }`}
        aria-label={`Toggle ${label}`}
      >
        <motion.div
          className={`absolute top-1 left-1 w-8 h-8 rounded-full shadow-lg ${
            checked ? 'bg-background' : 'bg-muted-foreground'
          }`}
          animate={{
            x: checked ? 40 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </button>
      <span className={`text-sm font-medium transition-colors ${
        checked ? 'text-warm-glow-soft' : 'text-muted-foreground'
      } ${isMaster ? 'text-base font-semibold' : ''}`}>
        {label}
      </span>
    </div>
  );
};
