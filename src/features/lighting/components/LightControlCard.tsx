import { useMotionValueEvent, AnimatePresence, motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useState, useRef, useCallback, useEffect } from "react";
import { getIconForLight } from "@/components/icons/LightIcons";
import { Loader2 } from "lucide-react";
import { LIGHT_ANIMATION, DATA_TRANSITION, EASING } from "@/constants/animations";
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

// Smooth transition config
const smoothTransition = {
  duration: 0.5,
  ease: EASING.smooth,
};

const crossfadeTransition = {
  duration: DATA_TRANSITION.dataEnter.duration,
  ease: EASING.smooth,
};

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
  
  // Use unified animation hook
  const { displayValue, animateTo } = useLightAnimation(id, { 
    initialValue: intensity 
  });
  
  const [displayNumber, setDisplayNumber] = useState(intensity);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractingRef = useRef(false);
  
  useMotionValueEvent(displayValue, "change", (latest) => {
    setDisplayNumber(Math.round(latest));
  });
  
  // Sync with external intensity changes
  useEffect(() => {
    if (!userInteractingRef.current && Math.abs(displayValue.get() - intensity) > 0.5) {
      animateTo(intensity, 'external');
    }
  }, [intensity, displayValue, animateTo]);
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-slider]')) {
      return;
    }
    
    triggerHaptic();
    
    const targetIntensity = isOn ? 0 : 100;
    
    userInteractingRef.current = true;
    animateTo(targetIntensity, 'user');
    onChange(targetIntensity);
    
    setTimeout(() => {
      userInteractingRef.current = false;
    }, LIGHT_ANIMATION.turnOn.duration * 1000);
  };

  const handleSliderChange = useCallback((values: number[]) => {
    const newValue = values[0];
    if (Math.abs(newValue - displayNumber) >= 10) {
      triggerHaptic();
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
  }, [displayNumber, onChange, animateTo]);

  return (
    <motion.button
      onClick={handleCardClick}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className="w-full rounded-2xl md:rounded-3xl px-4 md:px-8 py-3 md:py-4 cursor-pointer text-left border backdrop-blur-xl relative overflow-hidden"
      initial={false}
      animate={{
        backgroundColor: isLoading 
          ? 'rgba(255, 255, 255, 0.06)' 
          : 'rgba(0, 0, 0, 0)',
        borderColor: isLoading
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0)',
      }}
      transition={smoothTransition}
      whileHover={!isLoading ? {
        backgroundColor: isOn ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
        borderColor: isOn ? 'rgba(255, 255, 255, 0.20)' : 'rgba(255, 255, 255, 0.12)',
        transition: { duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }
      } : undefined}
      whileTap={!isLoading ? { 
        scale: 0.98,
        backgroundColor: isOn ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.10)',
        transition: { duration: 0.15 }
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
          x: { duration: DATA_TRANSITION.skeleton.shimmerDuration, repeat: Infinity, ease: "easeInOut" },
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
          className="absolute inset-0 bg-red-500/10 border-2 border-red-500/30 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onRetry?.();
          }}
        />
      )}

      <div className="flex items-center gap-3 md:gap-6 relative z-10">
        {/* Icon - crossfade between skeleton and real */}
        <div className="relative flex-shrink-0 w-5 h-5 md:w-7 md:h-7">
          {/* Skeleton circle */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/10"
            initial={false}
            animate={{ 
              opacity: isLoading ? [0.3, 0.5, 0.3] : 0 
            }}
            transition={isLoading ? { 
              duration: DATA_TRANSITION.skeleton.shimmerDuration, 
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
              filter: isLoading ? `blur(${DATA_TRANSITION.dataEnter.blur}px)` : 'blur(0px)',
              color: isOn ? 'hsl(44 92% 62%)' : 'rgba(255, 255, 255, 0.3)'
            }}
            transition={{
              ...crossfadeTransition,
              filter: { duration: 0.35, ease: EASING.smooth }
            }}
          >
            <IconComponent className="w-5 h-5 md:w-7 md:h-7" />
          </motion.div>
        </div>

        {/* Text Info */}
        <div className="flex-1 text-left min-w-0">
          {/* Label */}
          <div className="relative">
            <motion.div 
              className="absolute top-0 left-0 h-4 w-20 md:w-24 bg-white/10 rounded"
              initial={false}
              animate={{ 
                opacity: isLoading ? [0.3, 0.5, 0.3] : 0 
              }}
              transition={isLoading ? { 
                duration: DATA_TRANSITION.skeleton.shimmerDuration, 
                repeat: Infinity,
                ease: "easeInOut"
              } : crossfadeTransition}
            />
            <motion.div 
              className="font-light text-sm md:text-base text-white tracking-wide leading-tight"
              initial={false}
              animate={{ 
                opacity: isLoading ? 0 : 1,
                filter: isLoading ? `blur(${DATA_TRANSITION.dataEnter.blur}px)` : 'blur(0px)',
              }}
              transition={{
                ...crossfadeTransition,
                filter: { duration: 0.35, ease: EASING.smooth }
              }}
            >
              {label}
            </motion.div>
          </div>
          
          {/* Status */}
          <div className="relative mt-0.5">
            <motion.div 
              className="absolute top-0 left-0 h-3 w-10 bg-white/10 rounded"
              initial={false}
              animate={{ 
                opacity: isLoading ? [0.3, 0.5, 0.3] : 0 
              }}
              transition={isLoading ? { 
                duration: DATA_TRANSITION.skeleton.shimmerDuration, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.1
              } : crossfadeTransition}
            />
            <motion.div 
              className="text-[10px] md:text-xs font-light tracking-wide tabular-nums leading-tight"
              initial={false}
              animate={{
                opacity: isLoading ? 0 : 1,
                filter: isLoading ? `blur(${DATA_TRANSITION.dataEnter.blur}px)` : 'blur(0px)',
                color: isOn ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.5)'
              }}
              transition={{
                ...crossfadeTransition,
                filter: { duration: 0.35, ease: EASING.smooth }
              }}
            >
              {isOn ? `${displayNumber}%` : 'Off'}
            </motion.div>
          </div>
        </div>

        {/* Slider area */}
        <div 
          className="flex-shrink-0 flex items-center gap-2 md:gap-3 self-center"
          data-slider
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Spinner placeholder */}
          <div className="w-3 h-3 md:w-4 md:h-4 flex items-center justify-center flex-shrink-0">
            <AnimatePresence>
              {isPending && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 
                    className="w-3 h-3 md:w-4 md:h-4 text-white/40 animate-spin" 
                    strokeWidth={2}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Slider container */}
          <div className="relative w-20 md:w-32 flex items-center">
            {/* Skeleton slider */}
            <motion.div 
              className="absolute inset-0 flex items-center"
              initial={false}
              animate={{ opacity: isLoading ? 1 : 0 }}
              transition={crossfadeTransition}
            >
              <motion.div 
                className="w-full h-2 bg-white/10 rounded-full"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ 
                  duration: DATA_TRANSITION.skeleton.shimmerDuration, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
            </motion.div>
            
            {/* Real slider */}
            <motion.div 
              className="w-full"
              initial={false}
              animate={{ 
                opacity: isLoading ? 0 : 1,
                filter: isLoading ? `blur(${DATA_TRANSITION.dataEnter.blur}px)` : 'blur(0px)',
              }}
              transition={{
                ...crossfadeTransition,
                filter: { duration: 0.4, ease: EASING.smooth }
              }}
            >
              <Slider
                value={[displayNumber]}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
                className="w-20 md:w-32"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
