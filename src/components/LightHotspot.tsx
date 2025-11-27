import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Hue Go icon for Desk Lamp
const HueGoIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path d="M17.15,15.76c-2.89-2.04-6.85-6-8.9-8.9C6.18,3.92,6.81,3.12,9.73,5.15c2.96,2.05,7.07,6.17,9.12,9.13 C20.88,17.2,20.09,17.83,17.15,15.76 M19.88,14.02c-2.09-3.41-6.48-7.81-9.89-9.89C8.37,3.13,7.25,2.8,6.73,3.11 C4.49,4.93,3,7.97,3,11.08c0,3.09,1.41,5.85,3.63,7.67H6.38c-0.62,0-1.12,0.5-1.12,1.12c0,0.62,0.51,1.12,1.12,1.12h5.9 c0.07,0,0.14-0.01,0.21-0.02c0.14,0.01,0.28,0.02,0.43,0.02c3.07,0,6.16-1.53,7.97-3.72C21.2,16.75,20.86,15.63,19.88,14.02"/>
  </svg>
);

// Hue Wall Spot icon for Spotlight
const HueWallSpotIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path d="M17.54,16.14c-1.43,1.04-3.05,1.26-3.61,0.48c-0.56-0.78,0.14-2.25,1.57-3.29c1.43-1.04,3.04-1.26,3.61-0.48 C19.68,13.62,18.97,15.09,17.54,16.14 M20.71,12.45l-6.56-7.5c-0.67-0.87-2.65-0.43-4.41,0.98c-1.76,1.41-2.7,3.51-2.02,4.38 l0.66,0.94H6.73C6.69,10.34,6.58,9.47,6.4,8.78C6.21,8.05,5.96,7.63,5.72,7.53C5.68,7.51,5.63,7.5,5.59,7.5H4.16 c-0.04,0-0.09,0.01-0.13,0.03c-0.26,0.11-0.5,0.56-0.7,1.33c-0.44,1.75-0.44,4.54,0,6.29c0.2,0.77,0.44,1.22,0.7,1.33 c0.04,0.02,0.09,0.03,0.13,0.03h1.43c0.04,0,0.09-0.01,0.13-0.03c0.25-0.11,0.49-0.52,0.68-1.25c0.18-0.69,0.29-1.56,0.33-2.47h2.7 l3.71,5.3c0.83,1.16,3.2,0.85,5.29-0.7C20.52,15.81,21.54,13.61,20.71,12.45"/>
  </svg>
);

// Hue Room Computer icon for Monitor Light
const HueRoomComputerIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path d="M21.75,3.75c0.41,0,0.75,0.34,0.75,0.75v8.25h-21V4.5c0-0.41,0.34-0.75,0.75-0.75H21.75z M1.5,15v-0.75h21V15 c0,0.41-0.34,0.75-0.75,0.75h-9v3h1.5c0.41,0,0.75,0.34,0.75,0.75s-0.34,0.75-0.75,0.75h-4.5C9.34,20.25,9,19.91,9,19.5 s0.34-0.75,0.75-0.75h1.5v-3h-9C1.84,15.75,1.5,15.41,1.5,15z"/>
  </svg>
);

const getIconForLight = (id: string) => {
  switch (id) {
    case 'deskLamp':
      return HueGoIcon;
    case 'spotlight':
      return HueWallSpotIcon;
    case 'monitorLight':
      return HueRoomComputerIcon;
    default:
      return HueGoIcon;
  }
};

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
                  {/* Lamp icon circle - Exactly 42x42 pixels */}
                  <div
                    className={`
                      w-[42px] h-[42px] rounded-full flex items-center justify-center
                      transition-all duration-300 cursor-pointer flex-shrink-0
                      ${intensity > 0 
                        ? 'bg-white/15 hover:bg-white/20' 
                        : 'bg-white/10 hover:bg-white/15'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onIntensityChange(intensity > 0 ? 0 : 100);
                    }}
                  >
                    <IconComponent 
                      className={`w-8 h-8 transition-all duration-300 ${
                        intensity > 0 
                          ? 'text-white' 
                          : 'text-[rgb(180,180,180)]'
                      }`}
                    />
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
