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
        className={`w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center ${getStatusColor()} transition-colors duration-300 ${
          isConnected ? 'border-[hsl(43,88%,63%)]/40' : 'border-white/20'
        }`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Zap className="w-5 h-5" />
      </motion.div>

      {/* Tooltip */}
      {isHovered && (
        <motion.div
          className="intensity-tooltip absolute pointer-events-none z-50"
          style={{
            right: '100%',
            top: '50%',
            y: '-50%',
            x: '-12px',
          }}
          initial={{ scale: 0.92, opacity: 0, originX: 1, originY: 0.5 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            x: `calc(-12px + ${mousePos.x}px)`,
            y: `calc(-50% + ${mousePos.y}px)`
          }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ 
            scale: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
            opacity: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
            x: { type: "spring", stiffness: 120, damping: 18 },
            y: { type: "spring", stiffness: 120, damping: 18 }
          }}
        >
          <div className="bg-white/8 backdrop-blur-[24px] pl-5 pr-8 py-2.5 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.15),0_1px_4px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/20">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full backdrop-blur-xl flex items-center justify-center transition-colors duration-500 ${getStatusColor()}`}>
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-xs font-light text-foreground whitespace-nowrap pr-[15px]">
                {getTooltipText()}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
