import { useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { CircularProgress } from '@/components/CircularProgress';

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
      className="relative flex items-center cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Compact View */}
      {!isHovered && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-300"
        >
          <Icon className="w-4 h-4 text-white/60 transition-colors" strokeWidth={1.5} />
          <span className="text-sm font-light text-white/70 tabular-nums transition-colors">
            {displayValue}{unit}
          </span>
        </motion.div>
      )}

      {/* Expanded Tooltip - matching LightHotspot style exactly */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50
              bg-white/8 backdrop-blur-[24px]
              pl-5 pr-8 py-3 rounded-full
              shadow-[0_4px_24px_rgba(0,0,0,0.15),0_1px_4px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)]
              border border-white/20
              overflow-hidden"
            initial={{ 
              opacity: 0,
              scale: 0.92,
              originX: 0.5,
              originY: 0
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
                  <Icon className="w-5 h-5 text-white/50" strokeWidth={1.5} />
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
                  className="text-xs leading-tight text-white/40"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0
                  }}
                  transition={{
                    delay: 0.24,
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94]
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
