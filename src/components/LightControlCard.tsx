import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface LightControlCardProps {
  id: string;
  label: string;
  intensity: number;
  onChange: (intensity: number) => void;
}

export const LightControlCard = ({ id, label, intensity, onChange }: LightControlCardProps) => {
  const isOn = intensity > 0;
  
  const handleToggle = () => {
    onChange(isOn ? 0 : 100);
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="w-full bg-white/8 backdrop-blur-xl rounded-3xl p-6 border border-white/15 text-left transition-all duration-300 hover:bg-white/12 hover:scale-[1.02]"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-4">
        {/* Icon Circle */}
        <motion.div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isOn 
              ? 'bg-warm-glow/20 text-warm-glow' 
              : 'bg-white/5 text-muted-foreground'
          }`}
          animate={{
            boxShadow: isOn 
              ? '0 0 20px rgba(251, 191, 36, 0.3)' 
              : '0 0 0px rgba(251, 191, 36, 0)'
          }}
        >
          <Lightbulb size={24} />
        </motion.div>

        {/* Text Info */}
        <div className="flex-1">
          <div className="font-medium text-foreground">{label}</div>
          <motion.div 
            className="text-sm text-muted-foreground"
            animate={{
              color: isOn ? 'hsl(var(--warm-glow-soft))' : 'hsl(var(--muted-foreground))'
            }}
          >
            {isOn ? `${intensity}%` : 'Off'}
          </motion.div>
        </div>

        {/* Status Indicator */}
        <motion.div
          className={`w-2 h-2 rounded-full ${
            isOn ? 'bg-warm-glow' : 'bg-white/20'
          }`}
          animate={{
            scale: isOn ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isOn ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.button>
  );
};
