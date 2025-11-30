import { useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform, animate } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { CircularProgress } from '@/components/CircularProgress';
import { useEffect } from 'react';

interface ClimateIndicatorProps {
  icon: LucideIcon;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  colorType: 'temperature' | 'humidity' | 'airQuality' | 'battery' | 'default';
  isLoaded: boolean;
  formatValue?: (value: number) => string;
}

export const ClimateIndicator = ({
  icon: Icon,
  label,
  value,
  unit,
  min,
  max,
  colorType,
  isLoaded,
  formatValue
}: ClimateIndicatorProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking with spring physics - matching LightHotspot
  const mouseX = useSpring(0, { stiffness: 120, damping: 18 });
  const mouseY = useSpring(0, { stiffness: 120, damping: 18 });

  // Animated color based on value
  const animatedValue = useMotionValue(value);
  
  useEffect(() => {
    const controls = animate(animatedValue, value, {
      duration: 0.8,
      ease: [0.22, 0.03, 0.26, 1]
    });
    return () => controls.stop();
  }, [value, animatedValue]);

  // Helper function to get color based on value and type
  const getColor = (val: number, type: string): string => {
    switch (type) {
      case 'temperature':
        if (val <= 17) return 'hsl(200 70% 55%)';      // Cold - blue
        if (val <= 20) return 'hsl(180 60% 50%)';       // Cool - cyan
        if (val <= 24) return 'hsl(142 70% 45%)';       // Comfortable - green
        if (val <= 28) return 'hsl(35 90% 55%)';        // Warm - orange
        return 'hsl(0 75% 55%)';                         // Hot - red
      case 'humidity':
        if (val >= 40 && val <= 60) return 'hsl(142 70% 45%)'; // Optimal - green
        if ((val >= 30 && val < 40) || (val > 60 && val <= 70)) 
          return 'hsl(45 90% 55%)';                      // Acceptable - yellow
        return 'hsl(0 75% 55%)';                         // Poor - red
      case 'airQuality':
        if (val <= 12) return 'hsl(142 70% 45%)';       // Good - green
        if (val <= 35) return 'hsl(45 90% 55%)';        // Moderate - yellow
        if (val <= 55) return 'hsl(25 90% 55%)';        // Sensitive - orange
        return 'hsl(0 75% 55%)';                         // Unhealthy - red
      default:
        return 'hsl(44 85% 58%)';                        // Default warm amber
    }
  };

  const currentColor = getColor(value, colorType);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !isHovered) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / 30;
    const deltaY = (e.clientY - centerY) / 30;
    
    mouseX.set(deltaX);
    mouseY.set(deltaY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const displayValue = formatValue ? formatValue(value) : value.toFixed(1);

  return (
    <div 
      ref={containerRef}
      className="relative"
    >
      {/* Compact View - trigger area */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-300 cursor-pointer relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {/* Subtle colored glow behind icon */}
        <motion.div
          className="absolute left-3 w-4 h-4 rounded-full blur-md"
          animate={{
            backgroundColor: currentColor,
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            backgroundColor: { duration: 0.8, ease: [0.22, 0.03, 0.26, 1] },
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        <motion.div
          animate={{ color: currentColor }}
          transition={{ duration: 0.8, ease: [0.22, 0.03, 0.26, 1] }}
        >
          <Icon className="w-4 h-4 relative z-10" strokeWidth={1.5} />
        </motion.div>
        
        <motion.span 
          className="text-sm font-light tabular-nums relative z-10"
          animate={{ color: currentColor }}
          transition={{ duration: 0.8, ease: [0.22, 0.03, 0.26, 1] }}
        >
          {displayValue}{unit}
        </motion.span>
      </motion.div>

      {/* Expanded Tooltip - pointer-events-none to prevent hover conflicts */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 pointer-events-none
              bg-white/15 backdrop-blur-[40px] backdrop-saturate-150
              pl-5 pr-8 py-3 rounded-full
              shadow-[0_12px_40px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.2)]
              border border-white/30
              overflow-hidden
              [background:linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))]"
            initial={{ 
              opacity: 0,
              scale: 0.92
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              transition: {
                opacity: {
                  duration: 0.35,
                  ease: [0.25, 0.46, 0.45, 0.94]
                },
                scale: {
                  duration: 0.4,
                  ease: [0.34, 1.56, 0.64, 1]
                }
              }
            }}
            style={{
              x: mouseX,
              y: mouseY,
              transformOrigin: 'center top'
            }}
            exit={{ 
              opacity: 0,
              scale: 0.92,
              transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.6, 1]
              }
            }}
          >
            {/* Inner glow layer */}
            <motion.div 
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: { 
                  delay: 0.15,
                  duration: 0.35,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              style={{
                background: `radial-gradient(circle at 50% 50%, 
                  rgba(255, 255, 255, 0.03) 0%, 
                  transparent 70%)`
              }}
            />

            <div className="relative z-10 flex items-center gap-3">
              {/* Circular Progress with Icon */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1
                }}
                transition={{
                  delay: 0.12,
                  duration: 0.35,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              >
                <CircularProgress 
                  value={value} 
                  min={min} 
                  max={max} 
                  size={42} 
                  strokeWidth={2.5}
                  isLoaded={isLoaded}
                  colorType={colorType}
                  delay={0}
                >
                  <motion.div
                    animate={{ color: currentColor }}
                    transition={{ duration: 0.8, ease: [0.22, 0.03, 0.26, 1] }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color: 'currentColor' }} />
                  </motion.div>
                </CircularProgress>
              </motion.div>
              
              {/* Text content */}
              <div className="flex flex-col items-start gap-1.5">
                <motion.span 
                  className="font-medium text-white text-sm leading-tight whitespace-nowrap"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0 
                  }}
                  transition={{
                    delay: 0.18,
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  {label}
                </motion.span>
                <motion.span 
                  className="text-xs leading-tight"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    color: currentColor
                  }}
                  transition={{
                    delay: 0.24,
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    color: { duration: 0.8, ease: [0.22, 0.03, 0.26, 1] }
                  }}
                >
                  {displayValue}{unit}
                </motion.span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
