import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Lightbulb } from "lucide-react";

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
                className={`intensity-tooltip absolute z-50
                  ${id === 'spotlight' 
                    ? 'right-16 top-1/2 -translate-y-1/2' 
                    : '-bottom-16 left-1/2 -translate-x-1/2'
                  }
                  bg-white/8 backdrop-blur-xl
                  px-7 py-5 rounded-full 
                  shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]
                  border border-white/20
                  min-w-[240px]
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
                  transform: `translateY(${mousePos.y}px)`,
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
                          rgba(251, 191, 36, ${0.08 * (intensity / 100)}) 0%, 
                          transparent 70%)`
                      : 'none',
                  }}
                />

                <motion.div 
                  className="relative z-10 flex flex-col gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        delayChildren: 0.35,
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {/* Top row: Icon + Text */}
                  <motion.div 
                    className="flex items-center gap-3"
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { 
                        opacity: 1, 
                        y: 0,
                        transition: {
                          duration: 0.35,
                          ease: [0.16, 1, 0.3, 1]
                        }
                      }
                    }}
                  >
                    {/* Lamp icon circle */}
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        transition-all duration-300 cursor-pointer
                        ${intensity > 0 
                          ? 'bg-amber-400/30 hover:bg-amber-400/40' 
                          : 'bg-white/15 hover:bg-white/20'
                        }
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        onIntensityChange(intensity > 0 ? 0 : 100);
                      }}
                    >
                      <Lightbulb 
                        className={`w-5 h-5 transition-colors duration-300 ${
                          intensity > 0 ? 'text-amber-300' : 'text-white/40'
                        }`}
                      />
                    </div>
                    
                    {/* Text content - left aligned */}
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-white text-base leading-tight">
                        {label}
                      </span>
                      <span className="text-sm text-white/60 leading-tight mt-0.5">
                        {intensity > 0 ? `${Math.round(intensity)}%` : 'Off'}
                      </span>
                    </div>
                  </motion.div>
                  
                  {/* Slider */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { 
                        opacity: 1, 
                        y: 0,
                        transition: {
                          duration: 0.35,
                          ease: [0.16, 1, 0.3, 1]
                        }
                      }
                    }}
                  >
                    <Slider
                      value={[intensity]}
                      onValueChange={(value) => {
                        onIntensityChange(value[0]);
                      }}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
