import { motion } from "framer-motion";
import { useState } from "react";
import { Zap } from "lucide-react";

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
}

export const ConnectionStatusIndicator = ({ 
  isConnected
}: ConnectionStatusIndicatorProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / 30;
    const deltaY = (e.clientY - centerY) / 30;
    setMousePos({ x: deltaX, y: deltaY });
  };

  const getStatusColor = () => {
    if (!isConnected) return "text-foreground/30";
    return "text-[hsl(43,88%,63%)]";
  };

  const getTooltipText = () => {
    if (!isConnected) return "Not connected to Home Assistant";
    return "Connected to Home Assistant";
  };

  return (
    <div
      className="fixed top-6 right-20 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className={`w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center ${getStatusColor()} transition-colors duration-300`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Zap className="w-5 h-5" />
      </motion.div>

      {/* Tooltip */}
      {isHovered && (
        <motion.div
          className="intensity-tooltip absolute pointer-events-none"
          style={{
            left: '50%',
            top: '100%',
            x: '-50%',
            y: '12px',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            x: `calc(-50% + ${mousePos.x}px)`,
            y: `calc(12px + ${mousePos.y}px)`
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            scale: { type: "spring", stiffness: 150, damping: 20 },
            opacity: { duration: 0.15, ease: "easeInOut" },
            x: { type: "spring", stiffness: 150, damping: 20 },
            y: { type: "spring", stiffness: 150, damping: 20 }
          }}
        >
          <div className="bg-background/95 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 min-w-[140px]">
            <div className="flex items-center gap-3">
              <div className={`w-[42px] h-[42px] rounded-full backdrop-blur-xl flex items-center justify-center transition-colors duration-500 ${getStatusColor()}`}>
                <Zap className="w-7 h-7" />
              </div>
              <div className="text-sm font-light text-foreground whitespace-nowrap">
                {getTooltipText()}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
