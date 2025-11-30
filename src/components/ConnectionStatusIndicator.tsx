import { motion, AnimatePresence, useSpring } from "framer-motion";
import { useState, useRef } from "react";
import { Zap } from "lucide-react";

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  onReconnectClick?: () => void;
  inline?: boolean;
}

export const ConnectionStatusIndicator = ({ 
  isConnected,
  isReconnecting = false,
  onReconnectClick,
  inline = false
}: ConnectionStatusIndicatorProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLButtonElement>(null);
  
  // Mouse tracking with spring physics
  const mouseX = useSpring(0, { stiffness: 120, damping: 18 });
  const mouseY = useSpring(0, { stiffness: 120, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !isHovered) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / 30;
    const deltaY = (e.clientY - centerY) / 30;
    
    mouseX.set(deltaX);
    mouseY.set(deltaY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const getStatusColor = () => {
    if (isReconnecting) return "text-yellow-500 animate-pulse";
    if (!isConnected) return "text-foreground/30";
    return "text-white";
  };

  const getTooltipText = () => {
    if (isReconnecting) return "Reconnecting to Home Assistant...";
    if (!isConnected) return "Not connected - Click to reconnect";
    return "Connected to Home Assistant";
  };

  const handleClick = () => {
    if (!isConnected && !isReconnecting && onReconnectClick) {
      onReconnectClick();
    }
  };

  const isClickable = !isConnected && !isReconnecting;

  return (
    <motion.button
      ref={containerRef}
      onClick={handleClick}
      disabled={!isClickable}
      className={`hidden md:flex ${inline ? 'relative' : 'fixed top-6 right-6 z-50'} w-10 h-10 items-center justify-center rounded-lg hover:bg-white/5 transition-all duration-300 ${getStatusColor()} ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      initial={inline ? false : { opacity: 0, scale: 0.8 }}
      animate={inline ? false : { opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={isClickable ? { scale: 0.95 } : { scale: 1.02 }}
      transition={inline ? undefined : { duration: 0.3, delay: 0.6 }}
      aria-label={getTooltipText()}
    >
      <Zap className="w-5 h-5" strokeWidth={1.5} />

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute pointer-events-none z-50
              bg-white/8 backdrop-blur-[24px]
              pl-5 pr-8 py-2.5 rounded-full
              shadow-[0_4px_24px_rgba(0,0,0,0.15),0_1px_4px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)]
              border border-white/20"
            style={{
              right: '100%',
              top: '50%',
              marginRight: '12px',
              x: mouseX,
              y: mouseY,
              translateY: '-50%',
              transformOrigin: 'right center'
            }}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: {
                scale: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
                opacity: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }
              }
            }}
            exit={{ 
              scale: 0.92, 
              opacity: 0,
              transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.6, 1]
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full backdrop-blur-xl flex items-center justify-center transition-colors duration-500 ${getStatusColor()}`}>
                <Zap className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="text-xs font-light text-foreground whitespace-nowrap pr-[15px]">
                {getTooltipText()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
