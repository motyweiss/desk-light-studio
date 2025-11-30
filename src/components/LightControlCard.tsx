import { useMotionValueEvent, AnimatePresence, motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useState, useRef, useCallback, useEffect } from "react";
import { getIconForLight } from "@/components/icons/LightIcons";
import { Loader2 } from "lucide-react";
import { LIGHT_ANIMATION } from "@/constants/animations";
import { useLightAnimation } from "@/hooks/useLightAnimation";

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
  const { displayValue, isAnimating, animateTo } = useLightAnimation(id, { 
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
    // Only toggle if clicking outside the slider
    if ((e.target as HTMLElement).closest('[data-slider]')) {
      return;
    }
    
    triggerHaptic();
    
    const targetIntensity = isOn ? 0 : 100;
    
    // Animate and notify immediately
    userInteractingRef.current = true;
    animateTo(targetIntensity, 'user');
    onChange(targetIntensity);
    
    // Reset user interaction flag after animation
    setTimeout(() => {
      userInteractingRef.current = false;
    }, LIGHT_ANIMATION.turnOn.duration * 1000);
  };

  const handleSliderChange = useCallback((values: number[]) => {
    const newValue = values[0];
    if (Math.abs(newValue - displayNumber) >= 10) {
      triggerHaptic();
    }
    
    // Update display immediately
    userInteractingRef.current = true;
    animateTo(newValue, 'user', { immediate: true });
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce: Send to onChange after 300ms
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
      userInteractingRef.current = false;
    }, 300);
  }, [displayNumber, onChange, animateTo]);

  // Skeleton loading state
  if (isLoading) {
    return (
      <motion.div
        layout
        className="w-full rounded-3xl px-8 py-4 text-left transition-all duration-500 relative overflow-hidden border-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'transparent',
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="flex items-center gap-6 relative z-10">
          <motion.div
            className="flex-shrink-0 w-7 h-7 rounded-full bg-white/5"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <div className="flex-1 space-y-2">
            <motion.div 
              className="h-4 w-24 bg-white/5 rounded"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.1
              }}
            />
            <motion.div 
              className="h-3 w-12 bg-white/5 rounded"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
          </div>

          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-4 h-4" />
            <motion.div 
              className="w-32 h-2 bg-white/5 rounded-full"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      layout
      onClick={handleCardClick}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className="w-full rounded-3xl px-8 py-4 cursor-pointer text-left border transition-all duration-500 backdrop-blur-xl relative overflow-hidden"
      initial={{
        backgroundColor: isOn ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)',
        borderColor: isOn ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
      }}
      animate={{
        backgroundColor: isOn ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)',
        borderColor: isOn ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
      }}
      transition={{
        layout: { duration: 0.25, ease: LIGHT_ANIMATION.slider.ease },
        backgroundColor: { duration: 0.5, ease: LIGHT_ANIMATION.turnOn.ease },
        borderColor: { duration: 0.5, ease: LIGHT_ANIMATION.turnOn.ease },
      }}
      whileHover={{
        backgroundColor: isOn ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.12)',
        borderColor: isOn ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
        scale: 1.005,
        transition: { duration: 0.4, ease: LIGHT_ANIMATION.turnOn.ease }
      }}
      whileTap={{ scale: 0.985 }}
    >
      {/* Pending State Overlay */}
      {isPending && (
        <motion.div
          className="absolute inset-0 bg-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

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

      <div className="flex items-center gap-6 relative z-10">
        {/* Icon */}
        <motion.div
          className="flex-shrink-0"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            color: isOn ? 'hsl(44 92% 62%)' : 'rgba(255, 255, 255, 0.3)'
          }}
          transition={{ 
            scale: { duration: 0.4, ease: LIGHT_ANIMATION.turnOn.ease },
            opacity: { duration: 0.35, ease: LIGHT_ANIMATION.turnOn.ease },
            color: { duration: 0.5, ease: LIGHT_ANIMATION.turnOn.ease }
          }}
        >
          <IconComponent className="w-7 h-7" />
        </motion.div>

        {/* Text Info */}
        <div className="flex-1 text-left min-w-0 space-y-0.5">
          <div className="font-light text-base text-white tracking-wide">{label}</div>
          <motion.div 
            className="text-xs font-light tracking-wide tabular-nums"
            animate={{
              color: isOn ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.5)'
            }}
            transition={{ duration: 0.5 }}
          >
            {isOn ? `${displayNumber}%` : 'Off'}
          </motion.div>
        </div>

        {/* Slider with Pending Indicator */}
        <div 
          className="flex-shrink-0 flex items-center gap-3"
          data-slider
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Spinner - Left of Slider with fixed width */}
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <AnimatePresence>
              {isPending && (
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
          
          <Slider
            value={[displayNumber]}
            onValueChange={handleSliderChange}
            max={100}
            step={1}
            className="w-32"
          />
        </div>
      </div>
    </motion.button>
  );
};
