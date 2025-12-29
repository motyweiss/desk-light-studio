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
                y: 8,
                scale: 0.96
              }}
              animate={{ 
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{ 
                opacity: 0,
                y: 6,
                scale: 0.97
              }}
              transition={{
                duration: TIMING.fast,
                ease: EASE.out
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
              <div className="bg-popover/95 backdrop-blur-xl rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[180px]">
                {/* Header with icon and value */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/8 border border-white/5">
                    <Icon className="w-4 h-4 text-white/70" strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-xl font-light text-foreground tabular-nums tracking-tight">
                      {value}
                      <span className="text-xs text-muted-foreground ml-1">{unit}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium tracking-[0.08em] uppercase">
                      {label}
                    </div>
                  </div>
                </div>

                {/* Trend Graph */}
                <div className="pt-1 border-t border-border/30">
                  <TrendGraph 
                    data={trendData}
                    width={160}
                    height={36}
                    color={color}
                    animate={isOpen}
                    colorType={colorType}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
