import { motion, useMotionValue, animate, useMotionValueEvent } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { getIconForLight } from "@/components/icons/LightIcons";

interface LightControlCardProps {
  id: string;
  label: string;
  intensity: number;
  onChange: (intensity: number) => void;
  onHover: (lightId: string | null) => void;
}

export const LightControlCard = ({ id, label, intensity, onChange, onHover }: LightControlCardProps) => {
  const IconComponent = getIconForLight(id);
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
  
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only toggle if clicking outside the slider
    if ((e.target as HTMLElement).closest('[data-slider]')) {
      return;
    }
    
    triggerHaptic();
    
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
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className="w-full bg-transparent rounded-none px-4 py-3.5 hover:bg-white/[0.03] active:bg-white/[0.02] transition-colors duration-300 cursor-pointer text-left"
      transition={{
        layout: { duration: 0.25, ease: [0.22, 0.03, 0.26, 1] },
        scale: { duration: 0.35, ease: [0.22, 0.03, 0.26, 1] }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2 md:gap-4">
        {/* Icon Circle - Exactly 42x42 pixels with frosted glass effect, no fill */}
        <div
          className="w-12 h-12 md:w-[42px] md:h-[42px] rounded-full flex items-center justify-center pointer-events-none flex-shrink-0 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              color: isOn ? 'hsl(43 90% 60%)' : 'rgb(180, 180, 180)'
            }}
            transition={{ 
              scale: { duration: 0.4, ease: [0.22, 0.03, 0.26, 1] },
              opacity: { duration: 0.35, ease: [0.22, 0.03, 0.26, 1] },
              color: { duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }
            }}
          >
            <IconComponent className="w-7 h-7 md:w-7 md:h-7" />
          </motion.div>
        </div>

        {/* Text Info */}
        <div className="flex-1 text-left min-w-0 space-y-1">
          <div className="font-light text-sm md:text-base text-foreground tracking-wide">{label}</div>
          <motion.div 
            className="text-xs md:text-xs font-light tracking-wider tabular-nums"
            animate={{
              color: isOn ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.25)'
            }}
            transition={{ duration: 0.3 }}
          >
            {isOn ? `${displayNumber}%` : 'Off'}
          </motion.div>
        </div>

        {/* Slider - Always Visible on Right */}
        <div 
          className="w-24 md:w-32 flex-shrink-0 pr-4"
          data-slider
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Slider
            value={[displayNumber]}
            onValueChange={(values) => {
              const newValue = values[0];
              if (Math.abs(newValue - displayNumber) >= 10) {
                triggerHaptic();
              }
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
