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
                className="backdrop-blur-[32px] rounded-3xl px-6 py-5 min-w-[240px] overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {/* Header with icon and value */}
                <div className="flex items-center gap-5 mb-5">
                  {/* Icon circle - subtle frosted glass */}
                  <motion.div
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.06] border border-white/[0.08]"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.12,
                      duration: 0.35,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                  >
                    <Icon className="w-6 h-6 text-white/50" strokeWidth={1.5} />
                  </motion.div>
                  
                  {/* Text content */}
                  <div className="flex flex-col items-start gap-0.5">
                    <motion.span 
                      className="text-[28px] font-light text-white/90 tabular-nums tracking-tight leading-none"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.18,
                        duration: 0.35,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    >
                      {value}
                    </motion.span>
                    <motion.span 
                      className="text-[11px] text-white/35 font-light tracking-[0.15em] uppercase mt-1"
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
                  className="pt-2"
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
                    width={200}
                    height={52}
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
