import { motion, useMotionValue, animate, useMotionValueEvent } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

const LightIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path 
      d="M5.14286 14C4.41735 12.8082 4 11.4118 4 9.91886C4 5.54539 7.58172 2 12 2C16.4183 2 20 5.54539 20 9.91886C20 11.4118 19.5827 12.8082 18.8571 14" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M7.38287 17.0982C7.291 16.8216 7.24507 16.6833 7.25042 16.5713C7.26174 16.3343 7.41114 16.1262 7.63157 16.0405C7.73579 16 7.88105 16 8.17157 16H15.8284C16.119 16 16.2642 16 16.3684 16.0405C16.5889 16.1262 16.7383 16.3343 16.7496 16.5713C16.7549 16.6833 16.709 16.8216 16.6171 17.0982C16.4473 17.6094 16.3624 17.8651 16.2315 18.072C15.9572 18.5056 15.5272 18.8167 15.0306 18.9408C14.7935 19 14.525 19 13.9881 19H10.0119C9.47495 19 9.2065 19 8.96944 18.9408C8.47283 18.8167 8.04281 18.5056 7.7685 18.072C7.63755 17.8651 7.55266 17.6094 7.38287 17.0982Z" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M15 19L14.8707 19.6466C14.7293 20.3537 14.6586 20.7072 14.5001 20.9866C14.2552 21.4185 13.8582 21.7439 13.3866 21.8994C13.0816 22 12.7211 22 12 22C11.2789 22 10.9184 22 10.6134 21.8994C10.1418 21.7439 9.74484 21.4185 9.49987 20.9866C9.34144 20.7072 9.27073 20.3537 9.12932 19.6466L9 19" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M12 16V11" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

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
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className="w-full bg-white/8 backdrop-blur-xl rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-3.5 hover:bg-white/12 active:bg-white/15 transition-colors duration-200 cursor-pointer text-left"
      transition={{ 
        layout: { duration: 0.25, ease: [0.22, 0.03, 0.26, 1] },
        scale: { duration: 0.15, ease: [0.22, 0.03, 0.26, 1] }
      }}
      whileTap={{ scale: 0.96 }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* Icon Circle */}
        <motion.div
          className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center pointer-events-none flex-shrink-0"
          animate={{
            backgroundColor: isOn ? 'hsl(38 70% 58% / 0.2)' : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
        >
          <motion.div
            animate={{
              color: isOn ? 'hsl(38 70% 58%)' : 'rgba(255, 255, 255, 0.4)'
            }}
            transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
          >
            <LightIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </motion.div>
        </motion.div>

        {/* Text Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="font-light text-sm md:text-base text-foreground tracking-wide">{label}</div>
          <motion.div 
            className="text-[10px] md:text-xs font-light tracking-wider tabular-nums"
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
          className="w-24 md:w-32 flex-shrink-0"
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
