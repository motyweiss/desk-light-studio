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
      className="w-full bg-white/10 backdrop-blur-xl rounded-full px-6 py-4 border border-white/20 text-left"
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-4">
        {/* Icon Circle */}
        <motion.div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isOn 
              ? 'bg-warm-glow/20 text-warm-glow' 
              : 'bg-white/10 text-white/40'
          }`}
        >
          <Lightbulb size={20} />
        </motion.div>

        {/* Text Info */}
        <div className="flex-1">
          <div className="font-light text-base text-foreground tracking-wide">{label}</div>
          <motion.div 
            className="text-xs font-light tracking-wider"
            animate={{
              color: isOn ? 'hsl(var(--warm-glow-soft))' : 'rgba(255, 255, 255, 0.3)'
            }}
          >
            {isOn ? `${intensity}%` : 'Off'}
          </motion.div>
        </div>

        {/* Status Indicator */}
        <motion.div
          className={`w-1.5 h-1.5 rounded-full ${
            isOn ? 'bg-warm-glow' : 'bg-white/20'
          }`}
          animate={{
            scale: isOn ? [1, 1.3, 1] : 1,
            opacity: isOn ? [1, 0.6, 1] : 0.3,
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
