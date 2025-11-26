import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Slider } from "@/components/ui/slider";

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
    <motion.div
      layout
      className="w-full bg-white/8 backdrop-blur-xl rounded-2xl px-5 py-3.5 border border-white/15"
      transition={{ layout: { duration: 0.3, ease: [0.22, 0.03, 0.26, 1] } }}
    >
      <div className="flex items-center gap-4">
        {/* Icon Circle - Clickable Toggle */}
        <motion.button
          onClick={handleToggle}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isOn 
              ? 'bg-warm-glow/20 text-warm-glow' 
              : 'bg-white/10 text-white/40'
          }`}
          whileTap={{ scale: 0.92 }}
        >
          <Lightbulb size={18} />
        </motion.button>

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

      {/* Conditional Slider - Only When On */}
      <AnimatePresence>
        {isOn && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 0.03, 0.26, 1]
            }}
            className="overflow-hidden"
          >
            <Slider
              value={[intensity]}
              onValueChange={(values) => onChange(values[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
