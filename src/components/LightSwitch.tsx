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
            ? 'bg-gradient-to-r from-[hsl(38_70%_58%)] to-[hsl(32_55%_52%)] shadow-[0_0_20px_rgba(200,160,80,0.5)]' 
            : 'bg-white/10 shadow-inner'
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
              className="absolute inset-0 rounded-full bg-[hsl(38_70%_58%)]"
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
          color: checked ? 'hsl(42 65% 65%)' : 'rgba(255, 255, 255, 0.4)'
        }}
        transition={{ duration: 0.4 }}
      >
        {label}
      </motion.span>
    </div>
  );
};
