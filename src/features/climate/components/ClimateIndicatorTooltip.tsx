import { motion, AnimatePresence } from "framer-motion";
import { TrendGraph } from "./TrendGraph";
import { LucideIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

// Simple semi-transparent circle for the icon
const IconCircle = ({ children, size = 28 }: { children: React.ReactNode; size?: number }) => (
  <div 
    className="rounded-full bg-white/10 flex items-center justify-center"
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
        <div className="flex items-center gap-1.5 md:gap-2">
          <IconCircle size={24}>
            <Icon 
              className="w-3 h-3 text-white/80" 
              strokeWidth={1.5}
            />
          </IconCircle>
          <motion.div 
            className="text-xs font-light text-white/90 tabular-nums"
            animate={{
              opacity: isLoading ? 0.4 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            {isLoading && value === '0' ? '--' : (renderValue ? renderValue() : value)}
            {!isLoading && <span className="text-[10px] text-white/40 ml-0.5">{unit}</span>}
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
            <div className="bg-white/8 backdrop-blur-[24px] rounded-2xl px-5 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-white/20 min-w-[280px]">
              {/* Header with icon and value */}
              <div className="flex items-center gap-4 mb-3">
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl bg-white/10"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </motion.div>
                
                <div className="flex-1">
                  <motion.div
                    className="text-2xl font-light text-white tabular-nums"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.15,
                      duration: 0.35
                    }}
                  >
                    {value}
                    <span className="text-sm text-white/40 ml-1">{unit}</span>
                  </motion.div>
                  <motion.div
                    className="text-xs text-white/50 font-light"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.2,
                      duration: 0.35
                    }}
                  >
                    {label}
                  </motion.div>
                </div>
              </div>

              {/* Trend Graph */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.25,
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <TrendGraph 
                  data={trendData}
                  width={240}
                  height={50}
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
