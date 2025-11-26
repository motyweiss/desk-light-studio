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
  
  const handleCardClick = () => {
    onChange(isOn ? 0 : 100);
  };

  return (
    <motion.button
      layout
      onClick={handleCardClick}
      className="w-full bg-white/8 backdrop-blur-xl rounded-2xl px-5 py-3.5 hover:bg-white/12 transition-all duration-300 cursor-pointer text-left"
      transition={{ layout: { duration: 0.3, ease: [0.22, 0.03, 0.26, 1] } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-4">
        {/* Icon Circle */}
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 pointer-events-none ${
            isOn 
              ? 'bg-[hsl(38_70%_58%/0.2)] text-[hsl(38_70%_58%)]' 
              : 'bg-white/10 text-white/40'
          }`}
        >
          <Lightbulb size={18} />
        </motion.div>

        {/* Text Info */}
        <div className="flex-1 text-left">
          <div className="font-light text-base text-foreground tracking-wide">{label}</div>
          <motion.div 
            className="text-xs font-light tracking-wider"
            animate={{
              color: isOn ? 'hsl(42 65% 65%)' : 'rgba(255, 255, 255, 0.3)'
            }}
          >
            {isOn ? `${intensity}%` : 'Off'}
          </motion.div>
        </div>
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
              className="w-full pointer-events-auto"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
