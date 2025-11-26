import { motion, useMotionValue, animate, useMotionValueEvent } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

interface LightControlCardProps {
  id: string;
  label: string;
  intensity: number;
  onChange: (intensity: number) => void;
  onHover: (isHovered: boolean) => void;
}

export const LightControlCard = ({ id, label, intensity, onChange, onHover }: LightControlCardProps) => {
  const isOn = intensity > 0;
  const displayValue = useMotionValue(intensity);
  const [displayNumber, setDisplayNumber] = useState(intensity);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useMotionValueEvent(displayValue, "change", (latest) => {
    setDisplayNumber(Math.round(latest));
  });
  
  useEffect(() => {
    // Only sync if we're not in the middle of a toggle animation
    if (isAnimating) return;
    
    const controls = animate(displayValue, intensity, {
      duration: 1.2,
      ease: [0.22, 0.03, 0.26, 1]
    });
    
    return controls.stop;
  }, [intensity, displayValue, isAnimating]);
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Only toggle if clicking outside the slider
    if ((e.target as HTMLElement).closest('[data-slider]')) {
      return;
    }
    
    const currentValue = displayValue.get();
    const targetIntensity = isOn ? 0 : 100;
    const isTurningOff = targetIntensity === 0;
    
    setIsAnimating(true);
    
    // Animate from current to target - faster when turning off
    animate(displayValue, targetIntensity, {
      duration: isTurningOff ? 0.6 : 1.2,
      ease: [0.22, 0.03, 0.26, 1],
      onUpdate: (latest) => {
        onChange(Math.round(latest));
      },
      onComplete: () => {
        setIsAnimating(false);
      }
    });
  };

  return (
    <motion.button
      layout
      onClick={handleCardClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className="w-full bg-white/8 backdrop-blur-xl rounded-2xl px-5 py-3.5 hover:bg-white/12 transition-all duration-300 cursor-pointer text-left"
      transition={{ layout: { duration: 0.3, ease: [0.22, 0.03, 0.26, 1] } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-4">
        {/* Icon Circle */}
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 pointer-events-none flex-shrink-0 ${
            isOn 
              ? 'bg-[hsl(38_70%_58%/0.2)] text-[hsl(38_70%_58%)]' 
              : 'bg-white/10 text-white/40'
          }`}
        >
          <Lightbulb size={18} />
        </motion.div>

        {/* Text Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="font-light text-base text-foreground tracking-wide">{label}</div>
          <motion.div 
            className="text-xs font-light tracking-wider tabular-nums"
            animate={{
              color: isOn ? 'hsl(42 65% 65%)' : 'rgba(255, 255, 255, 0.3)'
            }}
            transition={{ duration: 0.3 }}
          >
            {isOn ? `${displayNumber}%` : 'Off'}
          </motion.div>
        </div>

        {/* Slider - Always Visible on Right */}
        <div 
          className="w-32 flex-shrink-0"
          data-slider
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Slider
            value={[displayNumber]}
            onValueChange={(values) => {
              const newValue = values[0];
              displayValue.set(newValue);
              onChange(newValue);
            }}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </motion.button>
  );
};
