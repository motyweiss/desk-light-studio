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
      <motion.div
        className="cursor-default"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-2.5 md:gap-3">
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
      </motion.div>

      {/* Tooltip - rendered via Portal */}
      {isOpen && trendData.length > 0 && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ 
              opacity: 0,
              scale: 0.92,
              y: -10
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0,
              scale: 0.92,
              y: -10
            }}
            transition={{
              duration: 0.35,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="fixed"
            style={{ 
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: 'translateX(-50%)',
              zIndex: 9999
            }}
          >
            <div className="bg-white/8 backdrop-blur-[20px] rounded-xl px-3.5 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-white/15 min-w-[200px]">
              {/* Header with icon and value */}
              <div className="flex items-center gap-3 mb-3.5">
                <motion.div
                  className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-lg bg-white/10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.05,
                    duration: 0.3,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                >
                  <Icon className="w-4 h-4 text-white/90" strokeWidth={1.5} />
                </motion.div>
                
                <div className="flex-1">
                  <motion.div
                    className="text-xl font-extralight text-white tabular-nums tracking-tight"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.08,
                      duration: 0.25
                    }}
                  >
                    {value}
                    <span className="text-xs text-white/30 ml-1 font-light">{unit}</span>
                  </motion.div>
                  <motion.div
                    className="text-[9px] text-white/40 font-medium tracking-[0.12em] uppercase"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.12,
                      duration: 0.25
                    }}
                  >
                    {label}
                  </motion.div>
                </div>
              </div>

              {/* Trend Graph */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15,
                  duration: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <TrendGraph 
                  data={trendData}
                  width={180}
                  height={36}
                  color={color}
                  animate={isOpen}
                  colorType={colorType}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
