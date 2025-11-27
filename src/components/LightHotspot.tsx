import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { getIconForLight } from "@/components/icons/LightIcons";

interface LightHotspotProps {
  id: 'spotlight' | 'deskLamp' | 'monitorLight';
  label: string;
  intensity: number; // 0-100
  position: { x: number; y: number }; // Percentages from container
  onIntensityChange: (value: number) => void;
  isContainerHovered: boolean;
  isExternallyHovered: boolean;
}

export const LightHotspot = ({ 
  id, 
  label, 
  intensity, 
  position, 
  onIntensityChange,
  isContainerHovered,
  isExternallyHovered
}: LightHotspotProps) => {
  const IconComponent = getIconForLight(id);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / 30; // Reduced sensitivity for subtlety
    const deltaY = (e.clientY - centerY) / 30;
    setMousePos({ x: deltaX, y: deltaY });
  };

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

  // Enhanced dynamic color scheme with intensity-based effects
  const isOn = intensity > 0;
  const intensityRatio = intensity / 100;
  const intensityCurve = Math.pow(intensityRatio, 0.7); // Non-linear for stronger high-intensity glow
  const dotOpacity = 0.35 + intensityCurve * 0.65;
  const dotColor = isOn 
    ? `hsla(38, 70%, 58%, ${dotOpacity})` 
    : "hsl(var(--foreground) / 0.5)";
  const glowColor = isOn 
    ? `rgba(200, 160, 80, ${0.25 + intensityCurve * 0.5})` 
    : "rgba(255, 255, 255, 0.25)";
  
  // Breathing animation adapts to intensity
  const breathingDuration = isOn ? 2.5 - (intensityRatio * 0.8) : 3;
  const breathingScale = isOn ? [1, 1.08 + (intensityRatio * 0.08), 1] : [0.98, 1.05, 0.98];

  return (
    <AnimatePresence>
      {(isContainerHovered || isExternallyHovered) && (
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
            setMousePos({ x: 0, y: 0 });
          }}
          onMouseMove={handleMouseMove}
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
            {/* Enhanced breathing ambient glow - intensity-adaptive */}
            <motion.circle
              cx="30"
              cy="30"
              r="22"
              fill={isOn ? `rgba(200, 160, 80, ${0.12 + intensityCurve * 0.15})` : "rgba(255, 255, 255, 0.06)"}
              animate={{
                opacity: isOn ? [0.4 + intensityRatio * 0.2, 0.7 + intensityRatio * 0.2, 0.4 + intensityRatio * 0.2] : [0.25, 0.4, 0.25],
                scale: breathingScale,
              }}
              transition={{
                duration: breathingDuration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ filter: `blur(${12 + intensityRatio * 4}px)` }}
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

            {/* Enhanced pulse ring - intensity-responsive */}
            <motion.circle
              cx="30"
              cy="30"
              r="13"
              fill="none"
              stroke={dotColor}
              strokeWidth={isOn ? "1.2" : "0.8"}
              strokeOpacity={isOn ? 0.4 + intensityRatio * 0.2 : 0.25}
              animate={{
                scale: [1, 1.1 + (intensityRatio * 0.08), 1],
                opacity: isOn ? [0.3 + intensityRatio * 0.1, 0.6 + intensityRatio * 0.2, 0.3 + intensityRatio * 0.1] : [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: breathingDuration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main frosted glass dot with layers */}
            <motion.g>
              {/* Enhanced deep glow layer - intensity-scaled */}
              <motion.circle
                cx="30"
                cy="30"
                r="11"
                fill={isOn ? `rgba(200, 160, 80, ${0.2 + intensityCurve * 0.25})` : "rgba(255, 255, 255, 0.07)"}
                animate={{
                  opacity: isOn ? (0.6 + intensityCurve * 0.35) : 0.28,
                  scale: isPressed ? 0.88 : isHovered ? 1.15 : 1,
                }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }}
                style={{ filter: `blur(${10 + intensityCurve * 6}px)` }}
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
                    ? `drop-shadow(0 0 ${6 + intensityCurve * 8}px rgba(200, 160, 80, ${0.4 + intensityCurve * 0.5})) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25))`
                    : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))'
                }}
              />

              {/* Enhanced inner warm core - intensity-scaled */}
              {isOn && (
                <motion.circle
                  cx="30"
                  cy="30"
                  r="7"
                  fill={`rgba(200, 160, 80, ${0.25 + intensityCurve * 0.3})`}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ 
                    opacity: [0.65 + intensityRatio * 0.15, 0.95 + intensityRatio * 0.05, 0.65 + intensityRatio * 0.15],
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ 
                    opacity: {
                      duration: breathingDuration * 0.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    scale: {
                      duration: 0.3
                    }
                  }}
                  style={{ filter: `blur(${3 + intensityRatio * 2}px)` }}
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

          {/* Interactive tooltip - micro-animations */}
          <AnimatePresence>
            {(isHovered || isExternallyHovered) && (
              <motion.div
                className={`intensity-tooltip absolute z-50
                  ${id === 'spotlight' 
                    ? 'right-8 top-1/2 -translate-y-1/2' 
                    : '-bottom-12 left-1/2 -translate-x-1/2'
                  }
                  bg-white/8
                  pl-5 pr-8 py-3 rounded-full
                  shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]
                  border border-white/20
                  overflow-hidden mr-10`}
                initial={{ 
                  scale: 0.9,
                  backdropFilter: "blur(0px)",
                  originX: id === 'spotlight' ? 1 : 0.5,
                  originY: id === 'spotlight' ? 0.5 : 0
                }}
                animate={{ 
                  scale: 1,
                  x: mousePos.x,
                  y: mousePos.y,
                  backdropFilter: "blur(24px)",
                  transition: {
                    scale: {
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    },
                    backdropFilter: {
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1]
                    },
                    x: {
                      type: "spring",
                      stiffness: 120,
                      damping: 18
                    },
                    y: {
                      type: "spring",
                      stiffness: 120,
                      damping: 18
                    }
                  }
                }}
                exit={{ 
                  scale: 0.9,
                  backdropFilter: "blur(0px)",
                  transition: {
                    duration: 0.2,
                    ease: [0.4, 0, 0.2, 1]
                  }
                }}
                style={{
                  transformOrigin: id === 'spotlight' ? 'right center' : 'center top'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* שכבת זוהר פנימית */}
                <motion.div 
                  className="absolute inset-0 rounded-full pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    transition: { 
                      delay: 0.2,
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1]
                    }
                  }}
                  style={{
                    background: intensity > 0
                      ? `radial-gradient(circle at 50% 50%, 
                          rgba(200, 160, 80, ${0.08 * (intensity / 100)}) 0%, 
                          transparent 70%)`
                      : 'none',
                  }}
                />

                <div className="relative z-10 flex items-center gap-3">
                  {/* Lamp icon circle - Exactly 42x42 pixels with frosted glass effect, no fill */}
                  <motion.div
                    className="w-[42px] h-[42px] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 backdrop-blur-xl"
                    initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      rotate: 0
                    }}
                    transition={{
                      delay: 0.15,
                      duration: 0.45,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onIntensityChange(intensity > 0 ? 0 : 100);
                    }}
                  >
                    <IconComponent 
                      className={`w-7 h-7 transition-colors duration-300 ${
                        intensity > 0 
                          ? 'text-[hsl(43_90%_60%)]' 
                          : 'text-[rgb(180,180,180)]'
                      }`}
                    />
                  </motion.div>
                  
                  {/* Text content - left aligned */}
                  <div className="flex flex-col items-start gap-0.5">
                    <motion.span 
                      className="font-medium text-white text-sm leading-tight whitespace-nowrap"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0 
                      }}
                      transition={{
                        delay: 0.22,
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1]
                      }}
                    >
                      {label}
                    </motion.span>
                    <motion.span 
                      className="text-xs text-white/60 leading-tight"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0 
                      }}
                      transition={{
                        delay: 0.3,
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1]
                      }}
                    >
                      {intensity > 0 ? `${Math.round(intensity)}%` : 'Off'}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
