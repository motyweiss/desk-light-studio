import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const displayValue = formatValue ? formatValue(value) : value.toFixed(1);

  return (
    <div 
      ref={containerRef}
      className="relative"
    >
      {/* Compact View - trigger area */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full 
          border border-white/15
          hover:border-white/25
          transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <Icon className="w-4 h-4 text-white/70 transition-colors" strokeWidth={1.5} />
        <span className="text-sm font-light text-white/80 tabular-nums transition-colors">
          {displayValue}{unit}
        </span>
      </div>

      {/* Expanded Tooltip - appears directly below badge, centered */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute z-[100] pointer-events-none
              bg-white/15 backdrop-blur-[40px] backdrop-saturate-150
              pl-4 pr-6 py-3 rounded-full
              shadow-[0_12px_40px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.2)]
              border border-white/30
              overflow-hidden
              [background:linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))]"
            style={{
              top: 'calc(100% + 12px)',
              left: 'calc(50% - 20px)',
              transform: 'translateX(-50%)',
              transformOrigin: '50% 0%'
            }}
            initial={{ 
              opacity: 0,
              scale: 0.3,
              y: -20
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                opacity: {
                  duration: 0.35,
                  ease: [0.25, 0.46, 0.45, 0.94]
                },
                scale: {
                  duration: 0.4,
                  ease: [0.34, 1.56, 0.64, 1]
                },
                y: {
                  duration: 0.4,
                  ease: [0.34, 1.56, 0.64, 1]
                }
              }
            }}
            exit={{ 
              opacity: 0,
              scale: 0.3,
              y: -20,
              transition: {
                duration: 0.25,
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
              
              {/* Text content - Value on top, Label below */}
              <div className="flex flex-col items-start gap-0.5">
                <motion.span 
                  className="text-lg font-medium text-white leading-tight tabular-nums"
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
                  {displayValue}{unit}
                </motion.span>
                <motion.span 
                  className="text-xs leading-tight text-white/60 whitespace-nowrap"
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
                  {label}
                </motion.span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
