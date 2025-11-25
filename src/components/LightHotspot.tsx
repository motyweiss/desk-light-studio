import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface LightHotspotProps {
  id: 'spotlight' | 'deskLamp' | 'monitorLight';
  label: string;
  isOn: boolean;
  position: { x: number; y: number }; // Percentages from container
  onToggle: () => void;
  isContainerHovered: boolean;
}

export const LightHotspot = ({ 
  id, 
  label, 
  isOn, 
  position, 
  onToggle, 
  isContainerHovered 
}: LightHotspotProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    onToggle();
    setTimeout(() => setIsPressed(false), 300);
  };

  // Color scheme based on light state
  const dotColor = isOn ? "hsl(var(--warm-glow))" : "hsl(var(--foreground))";
  const glowColor = isOn ? "rgba(251, 191, 36, 0.6)" : "rgba(255, 255, 255, 0.3)";

  return (
    <AnimatePresence>
      {isContainerHovered && (
        <motion.div
          className="absolute cursor-pointer"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          role="button"
          aria-label={`Toggle ${label}`}
          aria-pressed={isOn}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            className="overflow-visible"
          >
            {/* Outer glow ring - visible on hover/active */}
            <motion.circle
              cx="30"
              cy="30"
              r="20"
              fill="none"
              stroke={glowColor}
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered || isOn ? 0.4 : 0,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Pulse ring - infinite subtle animation */}
            <motion.circle
              cx="30"
              cy="30"
              r="15"
              fill="none"
              stroke={dotColor}
              strokeWidth="1.5"
              strokeOpacity="0.4"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main dot with glow */}
            <motion.g>
              {/* Glow effect */}
              <motion.circle
                cx="30"
                cy="30"
                r="12"
                fill={glowColor}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isOn ? 0.5 : 0.2,
                  scale: isPressed ? 0.9 : isHovered ? 1.2 : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{ filter: 'blur(8px)' }}
              />
              
              {/* Solid dot */}
              <motion.circle
                cx="30"
                cy="30"
                r="8"
                fill={dotColor}
                animate={{
                  scale: isPressed ? 0.85 : isHovered ? 1.15 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />

              {/* Inner highlight */}
              <motion.circle
                cx="28"
                cy="28"
                r="3"
                fill="white"
                opacity={isOn ? 0.8 : 0.4}
                animate={{
                  scale: isPressed ? 0.8 : 1,
                }}
                transition={{ duration: 0.15 }}
              />
            </motion.g>

            {/* Click ripple effect */}
            {isPressed && (
              <motion.circle
                cx="30"
                cy="30"
                r="8"
                fill="none"
                stroke={dotColor}
                strokeWidth="2"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            )}
          </svg>

          {/* Tooltip on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg border border-border pointer-events-none"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
