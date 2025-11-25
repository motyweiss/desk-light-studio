import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface LightHotspotProps {
  id: 'spotlight' | 'deskLamp' | 'monitorLight';
  label: string;
  intensity: number; // 0-100
  position: { x: number; y: number }; // Percentages from container
  onIntensityChange: (value: number) => void;
  isContainerHovered: boolean;
}

export const LightHotspot = ({ 
  id, 
  label, 
  intensity, 
  position, 
  onIntensityChange, 
  isContainerHovered 
}: LightHotspotProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't toggle if clicking inside tooltip
    if ((e.target as HTMLElement).closest('.intensity-tooltip')) {
      return;
    }
    setIsPressed(true);
    // Quick toggle: if off, set to 100%, if on, set to 0
    onIntensityChange(intensity > 0 ? 0 : 100);
    setTimeout(() => setIsPressed(false), 300);
  };

  // Dynamic color scheme based on intensity
  const isOn = intensity > 0;
  const intensityRatio = intensity / 100;
  const dotOpacity = 0.4 + intensityRatio * 0.6;
  const dotColor = isOn 
    ? `hsla(var(--warm-glow) / ${dotOpacity})` 
    : "hsl(var(--foreground) / 0.6)";
  const glowColor = isOn 
    ? `rgba(251, 191, 36, ${0.3 + intensityRatio * 0.4})` 
    : "rgba(255, 255, 255, 0.3)";

  return (
    <AnimatePresence>
      {isContainerHovered && (
        <motion.div
          className="absolute cursor-pointer pointer-events-auto"
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
          onMouseEnter={(e) => {
            e.stopPropagation();
            setIsHovered(true);
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            setIsHovered(false);
          }}
          onClick={handleClick}
          role="button"
          aria-label={`Toggle ${label}`}
          aria-pressed={isOn}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setIsPressed(true);
              onIntensityChange(intensity > 0 ? 0 : 100);
              setTimeout(() => setIsPressed(false), 300);
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

          {/* Interactive tooltip with slider */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="intensity-tooltip absolute -bottom-24 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-border min-w-[180px] z-50"
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="text-xs font-medium text-center mb-2 text-foreground">
                  {label}
                </div>
                <Slider
                  value={[intensity]}
                  onValueChange={([value]) => onIntensityChange(value)}
                  max={100}
                  step={1}
                  className="w-full cursor-pointer"
                />
                <div className="text-[10px] text-muted-foreground text-center mt-2 font-mono">
                  {intensity}%
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
