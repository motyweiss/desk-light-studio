import { motion, AnimatePresence } from "framer-motion";
import { TrendGraph } from "./TrendGraph";
import { LucideIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

// Simple semi-transparent circle for the icon
const IconCircle = ({ children, size = 36 }: { children: React.ReactNode; size?: number }) => (
  <div 
    className="rounded-full bg-white/8 flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    {children}
  </div>
);

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
      {/* Compact indicator - simple circle with icon */}
      <div className="cursor-default">
        <div className="flex items-center gap-1 md:gap-1.5">
          <IconCircle size={32}>
            <Icon 
              className="w-4 h-4 text-white/60" 
              strokeWidth={1.5}
              fill="none"
            />
          </IconCircle>
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
                y: 6,
                scale: 0.98
              }}
              animate={{ 
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{ 
                opacity: 0,
                y: 4,
                scale: 0.98
              }}
              transition={{
                duration: 0.2,
                ease: [0.32, 0.72, 0, 1]
              }}
              className="fixed pointer-events-none"
              style={{ 
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                transform: 'translateX(-50%)',
                zIndex: 9999,
                willChange: 'opacity, transform'
              }}
            >
              <div className="bg-[hsl(35_12%_18%/0.92)] backdrop-blur-xl rounded-2xl px-4 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.25)] border border-white/8 min-w-[200px]">
                {/* Header with icon and value */}
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 0.08,
                      duration: 0.15
                    }}
                  >
                    <Icon className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                  </motion.div>
                  
                  <div className="flex-1">
                    <motion.div
                      className="text-2xl font-light text-white tabular-nums tracking-tight"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.1,
                        duration: 0.15,
                        ease: [0.32, 0.72, 0, 1]
                      }}
                    >
                      {value}
                      <span className="text-sm text-white/40 ml-1 font-light">{unit}</span>
                    </motion.div>
                    <motion.div
                      className="text-[10px] text-white/50 font-medium tracking-[0.1em] uppercase mt-0.5"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.12,
                        duration: 0.15,
                        ease: [0.32, 0.72, 0, 1]
                      }}
                    >
                      {label}
                    </motion.div>
                  </div>
                </div>

                {/* Trend Graph */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 0.14,
                    duration: 0.2
                  }}
                >
                  <TrendGraph 
                    data={trendData}
                    width={180}
                    height={40}
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
