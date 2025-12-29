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
      className="w-full aspect-square rounded-2xl p-4 md:p-5 cursor-pointer text-left border backdrop-blur-xl relative overflow-hidden flex flex-col"
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
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
      } : undefined}
      whileTap={!isLoading ? { 
        scale: 0.98,
        backgroundColor: isOn ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.06)',
        transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
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
          className="absolute inset-0 bg-red-500/10 border-2 border-red-500/30 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onRetry?.();
          }}
        />
      )}

      {/* Top section: Icon + Spinner */}
      <div className="flex items-start justify-between relative z-10">
        {/* Icon */}
        <div className="relative w-7 h-7 md:w-8 md:h-8">
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
              color: isOn ? 'hsl(44 92% 62%)' : 'rgba(255, 255, 255, 0.35)'
            }}
            transition={{
              ...crossfadeTransition,
              filter: { duration: 0.35, ease: EASING.smooth }
            }}
          >
            <IconComponent className="w-7 h-7 md:w-8 md:h-8" />
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
                transition={{ duration: 0.2 }}
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

      {/* Spacer to push content to bottom */}
      <div className="flex-1" />

      {/* Bottom section: Label + Status + Slider */}
      <div className="relative z-10 space-y-3">
        {/* Label & Status */}
        <div className="space-y-0.5">
          {/* Label */}
          <div className="relative">
            <motion.div 
              className="absolute top-0 left-0 h-5 w-20 bg-white/10 rounded"
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
              className="font-light text-sm md:text-base text-white tracking-wide"
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
          <div className="relative">
            <motion.div 
              className="absolute top-0 left-0 h-4 w-10 bg-white/10 rounded"
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
              className="text-xs font-light tracking-wide tabular-nums"
              initial={false}
              animate={{
                opacity: isLoading ? 0 : 1,
                filter: isLoading ? `blur(${DATA_TRANSITION.dataEnter.blur}px)` : 'blur(0px)',
                color: isOn ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)'
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

        {/* Slider */}
        <div 
          className="w-full"
          data-slider
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Slider container */}
          <div className="relative w-full flex items-center">
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
                className="w-full"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
