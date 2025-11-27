import { motion, useMotionValue, animate, useMotionValueEvent } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

// Hue Go icon for Desk Lamp
const HueGoIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path d="M17.15,15.76c-2.89-2.04-6.85-6-8.9-8.9C6.18,3.92,6.81,3.12,9.73,5.15c2.96,2.05,7.07,6.17,9.12,9.13 C20.88,17.2,20.09,17.83,17.15,15.76 M19.88,14.02c-2.09-3.41-6.48-7.81-9.89-9.89C8.37,3.13,7.25,2.8,6.73,3.11 C4.49,4.93,3,7.97,3,11.08c0,3.09,1.41,5.85,3.63,7.67H6.38c-0.62,0-1.12,0.5-1.12,1.12c0,0.62,0.51,1.12,1.12,1.12h5.9 c0.07,0,0.14-0.01,0.21-0.02c0.14,0.01,0.28,0.02,0.43,0.02c3.07,0,6.16-1.53,7.97-3.72C21.2,16.75,20.86,15.63,19.88,14.02"/>
  </svg>
);

// Hue Wall Spot icon for Spotlight
const HueWallSpotIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path d="M17.54,16.14c-1.43,1.04-3.05,1.26-3.61,0.48c-0.56-0.78,0.14-2.25,1.57-3.29c1.43-1.04,3.04-1.26,3.61-0.48 C19.68,13.62,18.97,15.09,17.54,16.14 M20.71,12.45l-6.56-7.5c-0.67-0.87-2.65-0.43-4.41,0.98c-1.76,1.41-2.7,3.51-2.02,4.38 l0.66,0.94H6.73C6.69,10.34,6.58,9.47,6.4,8.78C6.21,8.05,5.96,7.63,5.72,7.53C5.68,7.51,5.63,7.5,5.59,7.5H4.16 c-0.04,0-0.09,0.01-0.13,0.03c-0.26,0.11-0.5,0.56-0.7,1.33c-0.44,1.75-0.44,4.54,0,6.29c0.2,0.77,0.44,1.22,0.7,1.33 c0.04,0.02,0.09,0.03,0.13,0.03h1.43c0.04,0,0.09-0.01,0.13-0.03c0.25-0.11,0.49-0.52,0.68-1.25c0.18-0.69,0.29-1.56,0.33-2.47h2.7 l3.71,5.3c0.83,1.16,3.2,0.85,5.29-0.7C20.52,15.81,21.54,13.61,20.71,12.45"/>
  </svg>
);

// Hue Room Computer icon for Monitor Light
const HueRoomComputerIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path d="M21.75,3.75c0.41,0,0.75,0.34,0.75,0.75v8.25h-21V4.5c0-0.41,0.34-0.75,0.75-0.75H21.75z M1.5,15v-0.75h21V15 c0,0.41-0.34,0.75-0.75,0.75h-9v3h1.5c0.41,0,0.75,0.34,0.75,0.75s-0.34,0.75-0.75,0.75h-4.5C9.34,20.25,9,19.91,9,19.5 s0.34-0.75,0.75-0.75h1.5v-3h-9C1.84,15.75,1.5,15.41,1.5,15z"/>
  </svg>
);

const getIconForLight = (id: string) => {
  switch (id) {
    case 'deskLamp':
      return HueGoIcon;
    case 'spotlight':
      return HueWallSpotIcon;
    case 'monitorLight':
      return HueRoomComputerIcon;
    default:
      return HueGoIcon;
  }
};

interface LightControlCardProps {
  id: string;
  label: string;
  intensity: number;
  onChange: (intensity: number) => void;
  onHover: (isHovered: boolean) => void;
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
        {/* Icon Circle - Exactly 42x42 pixels */}
        <motion.div
          className="w-[42px] h-[42px] rounded-full flex items-center justify-center pointer-events-none flex-shrink-0"
          animate={{
            backgroundColor: isOn ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)'
          }}
          transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: isOn ? 1 : 0.92,
              opacity: 1,
              color: isOn ? 'rgb(255, 255, 255)' : 'rgb(180, 180, 180)',
              rotateZ: isOn ? 0 : -8
            }}
            transition={{ 
              scale: { duration: 0.4, ease: [0.22, 0.03, 0.26, 1] },
              opacity: { duration: 0.35, ease: [0.22, 0.03, 0.26, 1] },
              color: { duration: 0.3, ease: [0.22, 0.03, 0.26, 1] },
              rotateZ: { duration: 0.35, ease: [0.22, 0.03, 0.26, 1] }
            }}
          >
            <IconComponent className="w-7 h-7" />
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
