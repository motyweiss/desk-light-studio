import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useLayoutEffect } from "react";
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
  const [debugMode, setDebugMode] = useState(false);
  const containerRef = useRef<HTMLButtonElement>(null);

  // Toggle debug mode with Ctrl+Shift+D
  useLayoutEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
        console.log('🐛 Debug mode:', !debugMode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode]);

  useLayoutEffect(() => {
    if (isHovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      console.log('🎯 Tooltip position calculation:', { rect, isHovered });
      const newPosition = {
        top: rect.bottom + 12,
        left: rect.left + rect.width / 2,
      };
      console.log('📍 Setting tooltip position:', newPosition);
      setTooltipPosition(newPosition);
    }
  }, [isHovered]);

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

  return (
    <>
      <motion.button
        ref={containerRef}
        onClick={handleClick}
        disabled={!isClickable}
        className={`hidden md:flex ${inline ? 'relative' : 'fixed top-6 right-6 z-50'} w-10 h-10 items-center justify-center rounded-lg hover:bg-white/5 transition-all duration-300 overflow-visible ${getStatusColor()} ${isClickable ? 'cursor-pointer' : 'cursor-default'} ${debugMode ? 'ring-2 ring-green-400' : ''}`}
      onMouseEnter={() => {
        console.log('🖱️ Mouse entered connection indicator');
        setIsHovered(true);
      }}
      onMouseLeave={handleMouseLeave}
      initial={inline ? false : { opacity: 0, scale: 0.8 }}
      animate={inline ? false : { opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={isClickable ? { scale: 0.95 } : { scale: 1.02 }}
      transition={inline ? undefined : { duration: 0.3, delay: 0.6 }}
      aria-label={getTooltipText()}
    >
        <Zap className="w-5 h-5" strokeWidth={1.5} />

        {/* Debug overlay for button */}
        {debugMode && containerRef.current && (
          <div 
            className="fixed pointer-events-none z-[300]"
            style={{
              top: containerRef.current.getBoundingClientRect().top - 2,
              left: containerRef.current.getBoundingClientRect().left - 2,
              width: containerRef.current.getBoundingClientRect().width + 4,
              height: containerRef.current.getBoundingClientRect().height + 4,
              border: '2px dashed lime',
              background: 'rgba(0, 255, 0, 0.1)'
            }}
          >
            <div className="absolute -top-6 left-0 text-xs bg-lime-500 text-black px-2 py-0.5 rounded">
              Button: {Math.round(containerRef.current.getBoundingClientRect().width)}x
              {Math.round(containerRef.current.getBoundingClientRect().height)}
            </div>
          </div>
        )}

        {/* Tooltip */}
        <AnimatePresence>
        {isHovered && tooltipPosition.top > 0 && (
          <>
            {console.log('✅ Rendering tooltip at:', tooltipPosition)}
            
            {/* Debug overlay for tooltip position */}
            {debugMode && (
              <div
                className="fixed pointer-events-none z-[300]"
                style={{
                  top: tooltipPosition.top - 50,
                  left: tooltipPosition.left - 100,
                  width: 200,
                  height: 100,
                }}
              >
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-yellow-400" />
                <div className="absolute top-0 left-0 w-full h-0.5 bg-yellow-400" />
                <div className="absolute top-12 left-0 text-xs bg-yellow-400 text-black px-2 py-1 rounded">
                  Tooltip: top={Math.round(tooltipPosition.top)}, left={Math.round(tooltipPosition.left)}
                </div>
                <div className="absolute top-0 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-red-500 rounded-full" />
              </div>
            )}

            <motion.div
            className={`fixed pointer-events-none z-[200]
              bg-white/12 backdrop-blur-[32px]
              px-5 py-2.5 rounded-full
              border border-white/25
              [background:linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))]
              ${debugMode ? 'ring-2 ring-purple-400' : ''}`}
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
                {debugMode && (
                  <div className="text-[10px] text-yellow-300 mt-1">
                    [DEBUG MODE: Ctrl+Shift+D to toggle]
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </motion.button>

      {/* Debug info panel */}
      {debugMode && (
        <div className="fixed top-20 right-6 z-[300] bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-xs">
          <div className="font-bold mb-2 text-lime-400">🐛 Tooltip Debug Mode</div>
          <div className="space-y-1">
            <div>isHovered: <span className="text-yellow-300">{isHovered.toString()}</span></div>
            <div>isConnected: <span className="text-yellow-300">{isConnected.toString()}</span></div>
            <div>isReconnecting: <span className="text-yellow-300">{isReconnecting.toString()}</span></div>
            <div>inline: <span className="text-yellow-300">{inline.toString()}</span></div>
            <div>tooltipPosition: <span className="text-yellow-300">
              {JSON.stringify(tooltipPosition)}
            </span></div>
            <div>containerRef: <span className="text-yellow-300">
              {containerRef.current ? 'attached' : 'null'}
            </span></div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/20 text-[10px] text-gray-400">
            Press Ctrl+Shift+D to toggle debug mode
          </div>
        </div>
      )}
    </>
  );
};
