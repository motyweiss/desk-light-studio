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
  const intensityCurve = Math.pow(intensityRatio, 0.6); // Smooth non-linear curve
  
  // Warm color palette matching page design
  const warmGlow = isOn 
    ? `hsl(43 ${90 - intensityRatio * 10}% ${60 + intensityRatio * 8}%)` 
    : "hsl(var(--foreground) / 0.4)";
  const warmGlowRgba = isOn 
    ? `rgba(${220 - intensityRatio * 20}, ${180 - intensityRatio * 10}, ${100 + intensityRatio * 20}, ${0.3 + intensityCurve * 0.6})` 
    : "rgba(255, 255, 255, 0.15)";
  
  // Dynamic breathing that feels alive
  const breathingDuration = isOn ? 2.2 - (intensityRatio * 0.6) : 2.8;
  const breathingScale = isOn 
    ? [1, 1.12 + (intensityRatio * 0.15), 1] 
    : [0.96, 1.06, 0.96];
  const pulseOpacity = isOn 
    ? [0.5 + intensityRatio * 0.2, 0.85 + intensityRatio * 0.15, 0.5 + intensityRatio * 0.2]
    : [0.3, 0.5, 0.3];

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
            width="80"
            height="80"
            viewBox="0 0 80 80"
            className="overflow-visible"
          >
            {/* Outer expanding glow waves - alive and breathing */}
            <motion.circle
              cx="40"
              cy="40"
              r="32"
              fill={warmGlowRgba}
              animate={{
                opacity: pulseOpacity,
                scale: breathingScale,
              }}
              transition={{
                duration: breathingDuration,
                repeat: Infinity,
                ease: [0.45, 0.05, 0.55, 0.95],
              }}
              style={{ filter: `blur(${16 + intensityCurve * 8}px)` }}
            />
            
            {/* Secondary pulse wave - offset timing */}
            <motion.circle
              cx="40"
              cy="40"
              r="28"
              fill={warmGlowRgba}
              animate={{
                opacity: isOn 
                  ? [0.3 + intensityRatio * 0.15, 0.6 + intensityRatio * 0.2, 0.3 + intensityRatio * 0.15]
                  : [0.2, 0.35, 0.2],
                scale: isOn 
                  ? [1.05, 1.18 + (intensityRatio * 0.12), 1.05]
                  : [1, 1.08, 1],
              }}
              transition={{
                duration: breathingDuration * 1.1,
                repeat: Infinity,
                ease: [0.45, 0.05, 0.55, 0.95],
                delay: breathingDuration * 0.3,
              }}
              style={{ filter: `blur(${14 + intensityCurve * 6}px)` }}
            />

            {/* Animated orbital rings - dynamic motion */}
            <motion.circle
              cx="40"
              cy="40"
              r="20"
              fill="none"
              stroke={warmGlow}
              strokeWidth="1"
              strokeOpacity={isOn ? 0.5 + intensityRatio * 0.2 : 0.25}
              animate={{
                scale: breathingScale,
                rotate: isOn ? 360 : 0,
                opacity: pulseOpacity,
              }}
              transition={{
                scale: {
                  duration: breathingDuration,
                  repeat: Infinity,
                  ease: [0.45, 0.05, 0.55, 0.95],
                },
                rotate: {
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear"
                },
                opacity: {
                  duration: breathingDuration,
                  repeat: Infinity,
                  ease: [0.45, 0.05, 0.55, 0.95],
                }
              }}
              style={{ filter: 'blur(0.5px)' }}
            />
            
            {/* Inner pulse ring with warm glow */}
            <motion.circle
              cx="40"
              cy="40"
              r="16"
              fill="none"
              stroke={warmGlow}
              strokeWidth={isOn ? "1.5" : "1"}
              strokeOpacity={isOn ? 0.6 + intensityRatio * 0.2 : 0.3}
              animate={{
                scale: [1, 1.15 + (intensityRatio * 0.12), 1],
                opacity: isOn 
                  ? [0.4 + intensityRatio * 0.15, 0.75 + intensityRatio * 0.15, 0.4 + intensityRatio * 0.15] 
                  : [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: breathingDuration * 0.85,
                repeat: Infinity,
                ease: [0.45, 0.05, 0.55, 0.95],
              }}
            />
            
            {/* Frosted outer ring */}
            <motion.circle
              cx="40"
              cy="40"
              r="18"
              fill="rgba(255, 255, 255, 0.04)"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.5"
              animate={{
                opacity: isHovered ? 0.5 : 0.25,
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{ 
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{ filter: 'blur(1px)' }}
            />

            {/* Main frosted glass dot with enhanced layers */}
            <motion.g>
              {/* Multi-layered deep glow */}
              <motion.circle
                cx="40"
                cy="40"
                r="13"
                fill={warmGlowRgba}
                animate={{
                  opacity: pulseOpacity,
                  scale: isPressed ? 0.85 : isHovered ? 1.18 : 1,
                }}
                transition={{ 
                  duration: 0.35,
                  ease: [0.4, 0, 0.2, 1]
                }}
                style={{ filter: `blur(${12 + intensityCurve * 8}px)` }}
              />
              
              {/* Secondary glow layer */}
              <motion.circle
                cx="40"
                cy="40"
                r="11"
                fill={isOn ? warmGlowRgba : "rgba(255, 255, 255, 0.08)"}
                animate={{
                  opacity: isOn ? (0.7 + intensityCurve * 0.25) : 0.3,
                  scale: isPressed ? 0.88 : isHovered ? 1.12 : 1,
                }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }}
                style={{ filter: `blur(${8 + intensityCurve * 4}px)` }}
              />
              
              {/* Frosted glass base with border */}
              <motion.circle
                cx="40"
                cy="40"
                r="10"
                fill="rgba(255, 255, 255, 0.15)"
                stroke={isOn ? warmGlow : "rgba(255, 255, 255, 0.35)"}
                strokeWidth={isOn ? "1" : "0.8"}
                animate={{
                  scale: isPressed ? 0.92 : isHovered ? 1.08 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 22,
                }}
                style={{ filter: 'blur(0.5px)' }}
              />

              {/* Vibrant inner warm core */}
              {isOn && (
                <motion.circle
                  cx="40"
                  cy="40"
                  r="8"
                  fill={warmGlow}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ 
                    opacity: [0.7 + intensityRatio * 0.15, 0.95, 0.7 + intensityRatio * 0.15],
                    scale: [1, 1.05, 1],
                  }}
                  exit={{ opacity: 0, scale: 0.3 }}
                  transition={{ 
                    opacity: {
                      duration: breathingDuration * 0.75,
                      repeat: Infinity,
                      ease: [0.45, 0.05, 0.55, 0.95]
                    },
                    scale: {
                      duration: breathingDuration * 0.75,
                      repeat: Infinity,
                      ease: [0.45, 0.05, 0.55, 0.95]
                    }
                  }}
                  style={{ filter: `blur(${2 + intensityRatio * 3}px)` }}
                />
              )}
              
              {/* Intense center spark */}
              {isOn && intensityRatio > 0.5 && (
                <motion.circle
                  cx="40"
                  cy="40"
                  r="4"
                  fill="hsl(45 95% 75%)"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0.6, 0.9, 0.6],
                    scale: [0.95, 1.08, 0.95],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ 
                    duration: breathingDuration * 0.6,
                    repeat: Infinity,
                    ease: [0.45, 0.05, 0.55, 0.95]
                  }}
                  style={{ filter: 'blur(1px)' }}
                />
              )}

              {/* Enhanced glass reflection highlights */}
              <motion.ellipse
                cx="36"
                cy="36"
                rx="4"
                ry="5"
                fill="white"
                opacity={0.6}
                animate={{
                  scale: isPressed ? 0.82 : 1,
                  opacity: isPressed ? 0.4 : 0.6,
                }}
                transition={{ duration: 0.18 }}
                style={{ filter: 'blur(1.5px)' }}
              />
              
              <motion.circle
                cx="35"
                cy="35"
                r="2"
                fill="white"
                opacity={0.85}
                animate={{
                  scale: isPressed ? 0.75 : 1,
                }}
                transition={{ duration: 0.18 }}
                style={{ filter: 'blur(0.5px)' }}
              />
            </motion.g>

            {/* Enhanced ripple waves on click */}
            {isPressed && (
              <>
                <motion.circle
                  cx="40"
                  cy="40"
                  r="10"
                  fill="none"
                  stroke={warmGlow}
                  strokeWidth="2"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  style={{ filter: 'blur(1px)' }}
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="10"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="1.5"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 3.2, opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  style={{ filter: 'blur(1.5px)' }}
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="10"
                  fill={warmGlowRgba}
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  style={{ filter: `blur(8px)` }}
                />
              </>
            )}
          </svg>

          {/* Interactive tooltip - micro-animations */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className={`intensity-tooltip absolute z-50
                  ${id === 'spotlight' 
                    ? 'right-8 top-1/2 -translate-y-1/2' 
                    : '-bottom-12 left-1/2 -translate-x-1/2'
                  }
                  bg-white/8 backdrop-blur-xl
                  px-5 py-3 rounded-full
                  shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]
                  border border-white/20
                  overflow-hidden`}
                initial={{ 
                  opacity: 0,
                  scaleX: 0,
                  scaleY: 0,
                  originX: id === 'spotlight' ? 1 : 0.5,
                  originY: id === 'spotlight' ? 0.5 : 0
                }}
                animate={{ 
                  opacity: 1,
                  scaleX: 1,
                  scaleY: 1,
                  x: mousePos.x,
                  y: mousePos.y,
                  transition: {
                    opacity: {
                      duration: 0.15,
                      ease: [0.16, 1, 0.3, 1]
                    },
                    scaleX: {
                      duration: 0.25,
                      ease: [0.16, 1, 0.3, 1]
                    },
                    scaleY: {
                      duration: 0.25,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.08
                    },
                    x: {
                      type: "spring",
                      stiffness: 150,
                      damping: 20
                    },
                    y: {
                      type: "spring",
                      stiffness: 150,
                      damping: 20
                    }
                  }
                }}
                exit={{ 
                  opacity: 0,
                  scaleX: 0.7,
                  scaleY: 0.7,
                  transition: {
                    duration: 0.15,
                    ease: [0.4, 0, 1, 1]
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
                      delay: 0.35,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1]
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

                <motion.div 
                  className="relative z-10 flex items-center gap-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      delay: 0.35,
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1]
                    }
                  }}
                >
                  {/* Lamp icon circle - Exactly 42x42 pixels with frosted glass effect, no fill */}
                  <div
                    className="w-[42px] h-[42px] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 backdrop-blur-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      onIntensityChange(intensity > 0 ? 0 : 100);
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1
                      }}
                      transition={{
                        scale: { duration: 0.4, ease: [0.22, 0.03, 0.26, 1] },
                        opacity: { duration: 0.35, ease: [0.22, 0.03, 0.26, 1] }
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
                  </div>
                  
                  {/* Text content - left aligned */}
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-white text-sm leading-tight whitespace-nowrap">
                      {label}
                    </span>
                    <span className="text-xs text-white/60 leading-tight mt-0.5">
                      {intensity > 0 ? `${Math.round(intensity)}%` : 'Off'}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
