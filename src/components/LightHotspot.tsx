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
            {/* Breathing ambient glow - soft pulsing */}
            <motion.circle
              cx="30"
              cy="30"
              r="22"
              fill={isOn ? "rgba(251, 191, 36, 0.15)" : "rgba(255, 255, 255, 0.08)"}
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ filter: 'blur(12px)' }}
            />

            {/* Outer frosted ring - subtle border */}
            <motion.circle
              cx="30"
              cy="30"
              r="16"
              fill="rgba(255, 255, 255, 0.05)"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="0.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isContainerHovered ? (isHovered ? 0.6 : 0.3) : 0.2,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ 
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{
                filter: 'blur(1px)',
              }}
            />

            {/* Gentle pulse ring - continuous breathing */}
            <motion.circle
              cx="30"
              cy="30"
              r="13"
              fill="none"
              stroke={dotColor}
              strokeWidth="1"
              strokeOpacity="0.3"
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main frosted glass dot with layers */}
            <motion.g>
              {/* Deep glow layer - warm ambient */}
              <motion.circle
                cx="30"
                cy="30"
                r="11"
                fill={isOn ? "rgba(251, 191, 36, 0.25)" : "rgba(255, 255, 255, 0.08)"}
                animate={{
                  opacity: isOn ? (0.5 + intensityRatio * 0.3) : 0.3,
                  scale: isPressed ? 0.88 : isHovered ? 1.15 : 1,
                }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }}
                style={{ filter: 'blur(10px)' }}
              />
              
              {/* Frosted glass base - translucent */}
              <motion.circle
                cx="30"
                cy="30"
                r="9"
                fill="rgba(255, 255, 255, 0.12)"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="0.8"
                animate={{
                  scale: isPressed ? 0.9 : isHovered ? 1.1 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                style={{
                  filter: isOn 
                    ? `drop-shadow(0 0 8px rgba(251, 191, 36, ${intensityRatio * 0.5})) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))`
                    : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))'
                }}
              />

              {/* Inner warm core when on */}
              {isOn && (
                <motion.circle
                  cx="30"
                  cy="30"
                  r="7"
                  fill={`rgba(251, 191, 36, ${intensityRatio * 0.35})`}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ 
                    opacity: [0.7, 1, 0.7],
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ 
                    opacity: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    scale: {
                      duration: 0.3
                    }
                  }}
                  style={{ filter: 'blur(3px)' }}
                />
              )}

              {/* Glass reflection highlights - multiple layers */}
              <motion.ellipse
                cx="27"
                cy="27"
                rx="3.5"
                ry="4"
                fill="white"
                opacity={0.5}
                animate={{
                  scale: isPressed ? 0.85 : 1,
                }}
                transition={{ duration: 0.15 }}
                style={{ filter: 'blur(1px)' }}
              />
              
              <motion.circle
                cx="26"
                cy="26"
                r="1.5"
                fill="white"
                opacity={0.8}
                animate={{
                  scale: isPressed ? 0.8 : 1,
                }}
                transition={{ duration: 0.15 }}
              />
            </motion.g>

            {/* Ripple effect on click - frosted wave */}
            {isPressed && (
              <>
                <motion.circle
                  cx="30"
                  cy="30"
                  r="9"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="1.5"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ filter: 'blur(1px)' }}
                />
                <motion.circle
                  cx="30"
                  cy="30"
                  r="9"
                  fill="none"
                  stroke={dotColor}
                  strokeWidth="1"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2.8, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </>
            )}
          </svg>

          {/* Interactive tooltip with slider - micro-animations */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="intensity-tooltip absolute -bottom-20 left-1/2 -translate-x-1/2 
                  bg-white/10 backdrop-blur-xl 
                  px-6 py-5 rounded-full 
                  shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]
                  border border-white/15
                  min-w-[180px] z-50
                  overflow-hidden"
                initial={{ 
                  opacity: 0, 
                  scale: 0.85, 
                  y: -5,
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    staggerChildren: 0.08,
                    delayChildren: 0.05
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.9, 
                  y: -5,
                  transition: { 
                    duration: 0.2,
                    staggerChildren: 0.03,
                    staggerDirection: -1
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* שכבת זוהר פנימית - מופיעה אחרונה */}
                <motion.div 
                  className="absolute inset-0 rounded-full pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    transition: { 
                      duration: 0.4,
                      delay: 0.25,
                      ease: "easeOut"
                    }
                  }}
                  exit={{ 
                    opacity: 0,
                    transition: { duration: 0.15 }
                  }}
                  style={{
                    background: isOn 
                      ? `radial-gradient(ellipse 100% 80% at 50% 100%, ${glowColor.replace(')', `, ${intensityRatio * 0.25})`)}  0%, transparent 60%)`
                      : 'none',
                  }}
                />
                
                {/* תוכן */}
                <div className="relative z-10">
                  {/* Label - מופיע שני */}
                  <motion.div 
                    className="text-sm font-light text-center mb-4 text-white/90 tracking-wider"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        duration: 0.25, 
                        ease: "easeOut",
                        delay: 0.1
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: 4,
                      transition: { duration: 0.15 }
                    }}
                  >
                    {label}
                  </motion.div>
                  
                  {/* Slider - מופיע שלישי */}
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scaleX: 1,
                      transition: { 
                        duration: 0.3, 
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.15
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      scaleX: 0.9,
                      transition: { duration: 0.15 }
                    }}
                  >
                    <Slider
                      value={[intensity]}
                      onValueChange={([value]) => onIntensityChange(value)}
                      max={100}
                      step={1}
                      className="w-full cursor-pointer"
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
