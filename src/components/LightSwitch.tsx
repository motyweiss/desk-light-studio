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
        className={`relative w-20 h-10 rounded-full transition-all duration-500 ease-out ${
          checked 
            ? 'bg-gradient-to-r from-warm-glow to-accent shadow-[0_0_20px_rgba(251,191,36,0.5)]' 
            : 'bg-secondary shadow-inner'
        }`}
        aria-label={`Toggle ${label}`}
      >
        <motion.div
          className={`absolute top-1 left-1 w-8 h-8 rounded-full shadow-lg transition-colors duration-300 ${
            checked ? 'bg-background' : 'bg-muted-foreground'
          }`}
          animate={{
            x: checked ? 40 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 35
          }}
        >
          {/* Inner glow when active */}
          {checked && (
            <motion.div
              className="absolute inset-0 rounded-full bg-warm-glow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
      </button>
      <motion.span 
        className={`text-sm font-medium ${
          isMaster ? 'text-base font-semibold' : ''
        }`}
        animate={{
          color: checked ? 'hsl(var(--warm-glow-soft))' : 'hsl(var(--muted-foreground))'
        }}
        transition={{ duration: 0.4 }}
      >
        {label}
      </motion.span>
    </div>
  );
};
