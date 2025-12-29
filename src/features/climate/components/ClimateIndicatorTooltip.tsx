import { motion, AnimatePresence } from "framer-motion";
import { TrendGraph } from "./TrendGraph";
import { LucideIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TIMING, EASE } from "@/lib/animations";

interface ClimateIndicatorTooltipProps {
  isOpen: boolean;
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  trendData: number[];
  color: string;
  position?: "top" | "bottom";
  onToggle: () => void;
  colorType: 'temperature' | 'humidity' | 'airQuality';
  isLoading?: boolean;
  renderValue?: () => React.ReactNode;
}

export const ClimateIndicatorTooltip = ({
  isOpen,
  icon: Icon,
  label,
  value,
  unit,
  trendData,
  color,
  position = "bottom",
  onToggle,
  colorType,
  isLoading = false,
  renderValue
}: ClimateIndicatorTooltipProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 12,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isOpen]);

  return (
    <div 
      ref={containerRef}
      className="relative"
      onMouseEnter={onToggle}
      onMouseLeave={onToggle}
    >
      {/* Compact indicator - icon without circle */}
      <div className="cursor-default">
        <div className="flex items-center gap-2 md:gap-2.5">
          <Icon 
            className="w-5 h-5 text-white/50" 
            strokeWidth={1.5}
            fill="none"
          />
          <motion.div 
            className="text-sm font-light text-white/90 tabular-nums tracking-tight"
            animate={{
              opacity: isLoading ? 0.4 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            {isLoading && value === '0' ? '--' : (renderValue ? renderValue() : value)}
            {!isLoading && <span className="text-xs text-white/40 ml-0.5">{unit}</span>}
          </motion.div>
        </div>
      </div>

      {/* Tooltip - rendered via Portal */}
      {createPortal(
        <AnimatePresence mode="wait">
          {isOpen && trendData.length > 0 && (
            <motion.div
              initial={{ 
                opacity: 0,
                y: 10,
                scale: 0.92
              }}
              animate={{ 
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{ 
                opacity: 0,
                y: 6,
                scale: 0.94
              }}
              transition={{
                opacity: {
                  duration: 0.35,
                  ease: [0.25, 0.46, 0.45, 0.94]
                },
                scale: {
                  duration: 0.4,
                  ease: [0.34, 1.56, 0.64, 1]
                },
                y: {
                  duration: 0.35,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              className="fixed pointer-events-none"
              style={{ 
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                transform: 'translateX(-50%)',
                zIndex: 99999,
                willChange: 'opacity, transform',
                transformOrigin: 'center top'
              }}
            >
              <div 
                className="backdrop-blur-[24px] rounded-2xl px-5 py-4 min-w-[220px] overflow-hidden"
                style={{
                  backgroundColor: 'hsl(36 22% 42% / 0.95)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {/* Header with icon and value */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Icon circle - frosted glass style */}
                  <motion.div
                    className="w-[48px] h-[48px] rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-xl bg-white/5 border border-white/10"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.12,
                      duration: 0.35,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                  >
                    <Icon className="w-6 h-6 text-white/70" strokeWidth={1.5} />
                  </motion.div>
                  
                  {/* Text content */}
                  <div className="flex flex-col items-start gap-1">
                    <motion.span 
                      className="text-2xl font-light text-white tabular-nums tracking-tight leading-tight"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.18,
                        duration: 0.35,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    >
                      {value}
                      <span className="text-sm text-white/40 ml-1 font-light">{unit}</span>
                    </motion.span>
                    <motion.span 
                      className="text-[10px] text-white/40 font-medium tracking-[0.12em] uppercase"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
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

                {/* Trend Graph */}
                <motion.div 
                  className="pt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  <TrendGraph 
                    data={trendData}
                    width={190}
                    height={48}
                    color={color}
                    animate={isOpen}
                    colorType={colorType}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
