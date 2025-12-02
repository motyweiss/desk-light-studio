import { motion, AnimatePresence } from "framer-motion";
import { CircularProgress } from "./CircularProgress";
import { TrendGraph } from "./TrendGraph";
import { LucideIcon } from "lucide-react";

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
  progressValue: number;
  progressMax: number;
  progressMin?: number;
  colorType: 'temperature' | 'humidity' | 'airQuality';
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
  progressValue,
  progressMax,
  progressMin = 0,
  colorType
}: ClimateIndicatorTooltipProps) => {
  return (
    <div className="relative">
      {/* Clickable indicator */}
      <motion.button
        onClick={onToggle}
        className="cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-3">
          <CircularProgress 
            value={progressValue}
            min={progressMin}
            max={progressMax}
            size={44}
            strokeWidth={2.5}
            isLoaded={true}
            colorType={colorType}
            delay={0}
          >
            <Icon className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          </CircularProgress>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/55 font-light tracking-[0.2em] uppercase mb-1">
              {label}
            </span>
            <div className="text-base font-light text-white tabular-nums">
              {value}
              <span className="text-xs text-white/40 ml-0.5">{unit}</span>
            </div>
          </div>
        </div>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ 
              opacity: 0,
              scale: 0.92,
              y: position === "bottom" ? -10 : 10
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0,
              scale: 0.92,
              y: position === "bottom" ? -10 : 10
            }}
            transition={{
              duration: 0.35,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className={`absolute left-1/2 -translate-x-1/2 z-50 ${
              position === "bottom" ? "top-full mt-3" : "bottom-full mb-3"
            }`}
          >
            <div className="bg-white/8 backdrop-blur-[24px] rounded-2xl px-5 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-white/20 min-w-[280px]">
              {/* Header with icon and value */}
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl"
                  style={{ backgroundColor: `${color}15` }}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color }} strokeWidth={1.5} />
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
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] text-white/40 font-light tracking-wider uppercase">
                    Last 24h Trend
                  </span>
                  <span className="text-[10px] text-white/30 font-light tabular-nums">
                    {trendData.length} readings
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <TrendGraph 
                    data={trendData}
                    width={240}
                    height={50}
                    color={color}
                    animate={isOpen}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
