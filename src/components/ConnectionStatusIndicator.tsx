import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLButtonElement>(null);

  // Calculate tooltip position when hovering
  const updateTooltipPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 12,
        left: rect.left + rect.width / 2,
      });
    }
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    updateTooltipPosition();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const getStatusColor = () => {
    if (isReconnecting) return "text-yellow-500 animate-pulse";
    if (!isConnected) return "text-foreground/30";
    return "text-white";
  };

  const getTooltipText = () => {
    if (isReconnecting) return "Reconnecting to Home Assistant...";
    if (!isConnected) return "Disconnected - Click to reconnect";
    return "Connected to Home Assistant";
  };

  const handleClick = () => {
    if (!isConnected && !isReconnecting && onReconnectClick) {
      onReconnectClick();
    }
  };

  const isClickable = !isConnected && !isReconnecting;

  // Render tooltip in portal to avoid clipping issues
  const renderTooltip = () => {
    if (!isHovered) return null;

    return createPortal(
      <AnimatePresence>
        <motion.div
          className="fixed pointer-events-none z-[200] bg-white/12 backdrop-blur-[32px] px-5 py-2.5 rounded-full border border-white/25 [background:linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))]"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateX(-50%)',
            transformOrigin: '50% 0%'
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
          <div className="text-xs font-light text-white whitespace-nowrap">
            {getTooltipText()}
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <>
      <motion.button
        ref={containerRef}
        onClick={handleClick}
        disabled={!isClickable}
        className={`hidden md:flex ${inline ? 'relative' : 'fixed top-6 right-6 z-50'} w-10 h-10 items-center justify-center rounded-lg hover:bg-white/5 transition-all duration-300 overflow-visible ${getStatusColor()} ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={inline ? false : { opacity: 0, scale: 0.8 }}
        animate={inline ? false : { opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={isClickable ? { scale: 0.95 } : { scale: 1.02 }}
        transition={inline ? undefined : { duration: 0.3, delay: 0.6 }}
        aria-label={getTooltipText()}
      >
        <Zap className="w-5 h-5" strokeWidth={1.5} />
      </motion.button>

      {renderTooltip()}
    </>
  );
};
