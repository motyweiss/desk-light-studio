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
  animationSource?: 'user' | 'external' | 'initial';
  onChange: (intensity: number) => void;
  onHover: (lightId: string | null) => void;
  onRetry?: () => void;
}

// Smooth transition config - extra gentle for on/off states
const smoothTransition = {
  duration: 0.65,
  ease: [0.22, 0.68, 0.35, 1.0] as const, // Smooth organic easing
};

const crossfadeTransition = {
  duration: TIMING.medium,
  ease: EASE.gentle,
};

const contentTransition = {
  duration: TIMING.slow,
  ease: EASE.gentle,
};

// Slider entrance - smooth and synchronized
const sliderEntranceTransition = {
  duration: 0.4,
  ease: [0.22, 0.68, 0.35, 1.0] as const,
};

// Icon glow transition - extra smooth
const iconTransition = {
  duration: 0.75,
  ease: [0.25, 0.1, 0.25, 1.0] as const,
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
  animationSource = 'initial',
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
  const { displayValue, animateTo, getCurrentValue } = useLightAnimation(id, { 
    initialValue: intensity 
  });
  
  // Display number tracks the rounded value for UI
  const [displayNumber, setDisplayNumber] = useState(intensity);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userInteractingRef = useRef(false);
  
  // User interaction lock - blocks external updates for a duration after user action
  const userLockRef = useRef<{ locked: boolean; unlockTime: number }>({ locked: false, unlockTime: 0 });
  
  const lockUserInteraction = useCallback((duration: number) => {
    userLockRef.current = { locked: true, unlockTime: Date.now() + duration };
  }, []);
  
  const isUserLocked = useCallback(() => {
    if (!userLockRef.current.locked) return false;
    if (Date.now() > userLockRef.current.unlockTime) {
      userLockRef.current.locked = false;
      return false;
    }
    return true;
  }, []);
  
  // Show slider only when light is on
  const showSlider = isOn;
  
  // Dynamic icon color based on intensity
  const iconColor = displayNumber > 0 
    ? `hsl(44 92% ${Math.max(52, 62 - (100 - displayNumber) * 0.1)}%)`
    : 'rgba(255, 255, 255, 0.35)';
  
  // Dynamic glow intensity
  const glowIntensity = displayNumber > 30 ? displayNumber / 100 : 0;
  
  useMotionValueEvent(displayValue, "change", (latest) => {
    setDisplayNumber(Math.round(latest));
  });
  
  // Sync with external intensity changes - handle all non-user updates
  useEffect(() => {
    // Skip if user is actively interacting or in lock period
    if (userInteractingRef.current || isUserLocked()) {
      console.log(`[LightCard ${id}] Skipping sync - user interacting or locked`);
      return;
    }
    
    // Skip if this is a user-initiated change
    if (animationSource === 'user') {
      console.log(`[LightCard ${id}] Skipping sync - user source`);
      return;
    }
    
    const currentValue = getCurrentValue();
    const diff = Math.abs(currentValue - intensity);
    
    console.log(`[LightCard ${id}] Sync check:`, {
      intensity,
      currentValue,
      diff,
      animationSource
    });
    
    // Only sync if difference is significant (> 1%)
    if (diff > 1) {
      console.log(`[LightCard ${id}] Syncing to ${intensity} from ${currentValue}`);
      
      // Use immediate update for initial load, animate for external updates
      if (animationSource === 'initial') {
        displayValue.set(intensity);
      } else {
        animateTo(intensity, 'external');
      }
      setDisplayNumber(intensity);
    }
  }, [intensity, animationSource, displayValue, animateTo, isUserLocked, getCurrentValue, id]);
  
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
    const animationDuration = isOn 
      ? SEQUENCES.lightControl.turnOffDuration 
      : SEQUENCES.lightControl.turnOnDuration;
    
    // Lock for animation duration + API call buffer (2 seconds extra)
    lockUserInteraction((animationDuration * 1000) + 2000);
    
    userInteractingRef.current = true;
    setDisplayNumber(targetIntensity);
    animateTo(targetIntensity, 'user');
    onChange(targetIntensity);
    
    // Collapse when turning off
    if (targetIntensity === 0) {
      setIsExpanded(false);
    }
    
    setTimeout(() => {
      userInteractingRef.current = false;
    }, animationDuration * 1000 + 500);
  };

  const handleSliderChange = useCallback((values: number[]) => {
    const newValue = values[0];
    
    // Lock during slider interaction + debounce + API buffer
    lockUserInteraction(1200);
    
    // Immediate visual update - sync both motion value and display number
    displayValue.set(newValue);
    setDisplayNumber(newValue);
    
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
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
      userInteractingRef.current = false;
    }, 300);
  }, [displayNumber, onChange, displayValue, isOn, lockUserInteraction]);

  return (
    <motion.button
      onClick={handleCardClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className="w-full aspect-[1/1.25] rounded-2xl p-5 pb-10 md:p-6 md:pb-12 cursor-pointer text-left border backdrop-blur-xl relative overflow-hidden flex flex-col"
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
        <div className="relative w-6 h-6 md:w-7 md:h-7">
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
          {/* Real icon with dynamic glow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={{
              opacity: isLoading ? 0 : 1,
              filter: isLoading ? 'blur(4px)' : 'blur(0px)',
              color: iconColor,
              scale: 1 + (displayNumber / 100) * 0.08,
            }}
            transition={iconTransition}
            style={{
              filter: glowIntensity > 0 
                ? `drop-shadow(0 0 ${8 * glowIntensity}px rgba(221, 175, 76, ${0.4 * glowIntensity}))`
                : 'none',
            }}
          >
            <IconComponent className="w-6 h-6 md:w-7 md:h-7" />
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
          className="mt-4 h-6 relative"
          data-slider
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
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
          <AnimatePresence mode="wait">
            {isOn && !isLoading && (
              <motion.div 
                className="absolute inset-0 flex items-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 0.68, 0.35, 1.0],
                }}
              >
                <Slider
                  value={[displayNumber]}
                  onValueChange={handleSliderChange}
                  onValueCommit={(values) => {
                    // Final value commit - ensure it's sent
                    onChange(values[0]);
                    userInteractingRef.current = false;
                  }}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inactive line - visible when off */}
          <AnimatePresence>
            {!isOn && !isLoading && (
              <motion.div 
                className="absolute inset-0 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 0.68, 0.35, 1.0] }}
              >
                <div className="w-full h-1.5 bg-white/30 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.button>
  );
};