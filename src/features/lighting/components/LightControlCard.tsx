import { useMotionValueEvent, AnimatePresence, motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useState, useRef, useCallback, useEffect } from "react";
import { getIconForLight } from "@/components/icons/LightIcons";
import { Loader2 } from "lucide-react";
import { TIMING, EASE, SEQUENCES } from "@/lib/animations";
import { useLightAnimation } from "../hooks/useLightAnimation";

interface LightControlCardProps {
  id: string;
  label: string;
  intensity: number;
  isPending?: boolean;
  hasError?: boolean;
  isLoading?: boolean;
  onChange: (intensity: number) => void;
  onHover: (lightId: string | null) => void;
  onRetry?: () => void;
}

// Smooth transition config using centralized tokens
const smoothTransition = {
  duration: TIMING.slow,
  ease: EASE.smooth,
};

const crossfadeTransition = {
  duration: TIMING.fast,
  ease: EASE.smooth,
};

const contentTransition = {
  duration: TIMING.slow,
  ease: EASE.gentle,
};

// Slider entrance - very soft and gentle
const sliderEntranceTransition = {
  duration: 0.6,
  ease: [0.16, 0.1, 0.3, 1] as const, // Very gentle ease
};

const LONG_PRESS_DURATION = 350; // ms
const AUTO_COLLAPSE_DELAY = 4000; // ms

export const LightControlCard = ({ 
  id, 
  label, 
  intensity, 
  isPending = false,
  hasError = false,
  isLoading = false,
  onChange, 
  onHover,
  onRetry 
}: LightControlCardProps) => {
  const IconComponent = getIconForLight(id);
  const isOn = intensity > 0;
  
  // Expansion state - slider visible when expanded OR when light is on
  const [isExpanded, setIsExpanded] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPressRef = useRef(false);
  
  // Use unified animation hook
  const { displayValue, animateTo } = useLightAnimation(id, { 
    initialValue: intensity 
  });
  
  const [displayNumber, setDisplayNumber] = useState(intensity);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userInteractingRef = useRef(false);
  
  // Show slider only when light is on
  const showSlider = isOn;
  
  useMotionValueEvent(displayValue, "change", (latest) => {
    setDisplayNumber(Math.round(latest));
  });
  
  // Sync with external intensity changes
  useEffect(() => {
    if (!userInteractingRef.current && Math.abs(displayValue.get() - intensity) > 0.5) {
      animateTo(intensity, 'external');
    }
  }, [intensity, displayValue, animateTo]);
  
  // Auto-collapse after inactivity (only for manual expansion when light is off)
  useEffect(() => {
    if (isExpanded && !isOn) {
      if (autoCollapseTimerRef.current) {
        clearTimeout(autoCollapseTimerRef.current);
      }
      autoCollapseTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, AUTO_COLLAPSE_DELAY);
    }
    
    return () => {
      if (autoCollapseTimerRef.current) {
        clearTimeout(autoCollapseTimerRef.current);
      }
    };
  }, [isExpanded, isOn, displayNumber]);
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
    };
  }, []);
  
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-slider]')) {
      return;
    }
    
    wasLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      wasLongPressRef.current = true;
      triggerHaptic();
      setIsExpanded(true);
    }, LONG_PRESS_DURATION);
  };
  
  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  const handlePointerLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-slider]')) {
      return;
    }
    
    // Don't toggle if it was a long press
    if (wasLongPressRef.current) {
      wasLongPressRef.current = false;
      return;
    }
    
    triggerHaptic();
    
    const targetIntensity = isOn ? 0 : 100;
    
    userInteractingRef.current = true;
    animateTo(targetIntensity, 'user');
    onChange(targetIntensity);
    
    // Collapse when turning off
    if (targetIntensity === 0) {
      setIsExpanded(false);
    }
    
    setTimeout(() => {
      userInteractingRef.current = false;
    }, SEQUENCES.lightControl.turnOnDuration * 1000);
  };

  const handleSliderChange = useCallback((values: number[]) => {
    const newValue = values[0];
    if (Math.abs(newValue - displayNumber) >= 10) {
      triggerHaptic();
    }
    
    // Reset auto-collapse timer on interaction
    if (autoCollapseTimerRef.current) {
      clearTimeout(autoCollapseTimerRef.current);
    }
    if (!isOn) {
      autoCollapseTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, AUTO_COLLAPSE_DELAY);
    }
    
    userInteractingRef.current = true;
    animateTo(newValue, 'user', { immediate: true });
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
      userInteractingRef.current = false;
    }, 300);
  }, [displayNumber, onChange, animateTo, isOn]);

  return (
    <motion.button
      onClick={handleCardClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className="w-full aspect-[1/1.15] rounded-2xl p-4 pb-6 md:p-5 md:pb-7 cursor-pointer text-left border backdrop-blur-xl relative overflow-hidden flex flex-col"
      initial={false}
      animate={{
        backgroundColor: isLoading 
          ? 'rgba(255, 255, 255, 0.04)' 
          : isOn 
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(255, 255, 255, 0.03)',
        borderColor: isLoading
          ? 'rgba(255, 255, 255, 0.08)'
          : isOn
            ? 'rgba(255, 255, 255, 0.12)'
            : 'rgba(255, 255, 255, 0.06)',
      }}
      transition={smoothTransition}
      whileHover={!isLoading ? {
        backgroundColor: isOn ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        borderColor: isOn ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.1)',
        transition: { duration: TIMING.medium, ease: EASE.smooth }
      } : undefined}
      whileTap={!isLoading ? { 
        scale: 0.98,
        backgroundColor: isOn ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.06)',
        transition: { duration: TIMING.fast, ease: EASE.smooth }
      } : undefined}
      style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
    >
      {/* Shimmer overlay - only visible during loading */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
        initial={false}
        animate={{ 
          x: isLoading ? ['0%', '200%'] : '0%',
          opacity: isLoading ? 1 : 0
        }}
        transition={isLoading ? { 
          x: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          opacity: crossfadeTransition
        } : { opacity: crossfadeTransition }}
      />

      {/* Pending State Overlay */}
      <motion.div
        className="absolute inset-0 bg-white/5"
        initial={false}
        animate={{ 
          opacity: isPending ? [0.3, 0.6, 0.3] : 0 
        }}
        transition={isPending ? { 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        } : smoothTransition}
      />

      {/* Error State Overlay */}
      {hasError && (
        <motion.div
          className="absolute inset-0 bg-red-500/10 border-2 border-red-500/30 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onRetry?.();
          }}
        />
      )}

      {/* Top section: Icon */}
      <div className="flex items-start justify-between relative z-10 mb-8 md:mb-10">
        {/* Icon */}
        <div className="relative w-8 h-8 md:w-9 md:h-9">
          {/* Skeleton circle */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/10"
            initial={false}
            animate={{ 
              opacity: isLoading ? [0.3, 0.5, 0.3] : 0 
            }}
            transition={isLoading ? { 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            } : crossfadeTransition}
          />
          {/* Real icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={{
              opacity: isLoading ? 0 : 1,
              filter: isLoading ? 'blur(4px)' : 'blur(0px)',
              color: isOn ? 'hsl(44 92% 62%)' : 'rgba(255, 255, 255, 0.35)'
            }}
            transition={{
              ...crossfadeTransition,
              filter: { duration: TIMING.medium, ease: EASE.smooth }
            }}
          >
            <IconComponent className="w-8 h-8 md:w-9 md:h-9" />
          </motion.div>
        </div>

        {/* Spinner */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <AnimatePresence>
            {isPending && !isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: TIMING.fast }}
              >
                <Loader2 
                  className="w-4 h-4 text-white/40 animate-spin" 
                  strokeWidth={2}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom section: Label + Status + Slider */}
      <div className="relative z-10 mt-auto">
        {/* Label & Status */}
        <div className="space-y-1">
          {/* Label */}
          <div className="relative">
            <motion.div 
              className="absolute top-0 left-0 h-5 w-20 bg-white/10 rounded"
              initial={false}
              animate={{ 
                opacity: isLoading ? [0.3, 0.5, 0.3] : 0 
              }}
              transition={isLoading ? { 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              } : crossfadeTransition}
            />
            <motion.div 
              className="font-normal text-xs md:text-sm text-white tracking-wide"
              initial={false}
              animate={{ 
                opacity: isLoading ? 0 : 1,
                filter: isLoading ? 'blur(4px)' : 'blur(0px)',
              }}
              transition={{
                ...crossfadeTransition,
                filter: { duration: TIMING.medium, ease: EASE.smooth }
              }}
            >
              {label}
            </motion.div>
          </div>
          
          {/* Status */}
          <div className="relative">
            <motion.div 
              className="absolute top-0 left-0 h-4 w-10 bg-white/10 rounded"
              initial={false}
              animate={{ 
                opacity: isLoading ? [0.3, 0.5, 0.3] : 0 
              }}
              transition={isLoading ? { 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.1
              } : crossfadeTransition}
            />
            <motion.div 
              className="text-xs font-light tracking-wide tabular-nums"
              initial={false}
              animate={{
                opacity: isLoading ? 0 : 1,
                filter: isLoading ? 'blur(4px)' : 'blur(0px)',
                color: isOn ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)'
              }}
              transition={{
                ...crossfadeTransition,
                filter: { duration: TIMING.medium, ease: EASE.smooth }
              }}
            >
              {isOn ? `${displayNumber}%` : 'Off'}
            </motion.div>
          </div>
        </div>

        {/* Slider area - always present, content animates */}
        <div 
          className="mt-4 h-5 relative"
          data-slider
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Skeleton slider */}
          <motion.div 
            className="absolute inset-0 flex items-center"
            initial={false}
            animate={{ opacity: isLoading ? 1 : 0 }}
            transition={crossfadeTransition}
          >
            <motion.div 
              className="w-full h-1.5 bg-white/10 rounded-full"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
          </motion.div>
          
          {/* Real slider - visible when on */}
          <motion.div 
            className="absolute inset-0 flex items-center"
            initial={false}
            animate={{ 
              opacity: isOn && !isLoading ? 1 : 0,
              y: isOn && !isLoading ? 0 : 3,
            }}
            transition={sliderEntranceTransition}
            style={{ pointerEvents: isOn ? 'auto' : 'none' }}
          >
            <Slider
              value={[displayNumber]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              className="w-full"
            />
          </motion.div>

          {/* Inactive line - visible when off */}
          <motion.div 
            className="absolute inset-0 flex items-center"
            initial={false}
            animate={{ 
              opacity: !isOn && !isLoading ? 0.2 : 0,
            }}
            transition={sliderEntranceTransition}
          >
            <div className="w-full h-1.5 bg-white/30 rounded-full" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
};