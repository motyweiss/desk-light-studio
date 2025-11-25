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
            {/* Outer glow ring - frosted glass style */}
            <motion.circle
              cx="30"
              cy="30"
              r="20"
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered || isOn ? 0.5 : 0,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                filter: isOn 
                  ? `drop-shadow(0 0 4px rgba(251, 191, 36, ${intensityRatio * 0.4}))`
                  : 'none'
              }}
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

            {/* Main dot with frosted glass effect */}
            <motion.g>
              {/* Outer glow - amber halo */}
              <motion.circle
                cx="30"
                cy="30"
                r="12"
                fill={isOn ? "rgba(251, 191, 36, 0.3)" : "rgba(255, 255, 255, 0.1)"}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isOn ? (0.4 + intensityRatio * 0.3) : 0.2,
                  scale: isPressed ? 0.9 : isHovered ? 1.2 : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{ filter: 'blur(8px)' }}
              />
              
              {/* Frosted glass dot - main element */}
              <motion.circle
                cx="30"
                cy="30"
                r="8"
                fill="rgba(255, 255, 255, 0.2)"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
                animate={{
                  scale: isPressed ? 0.85 : isHovered ? 1.15 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                style={{
                  filter: isOn 
                    ? `drop-shadow(0 0 6px rgba(251, 191, 36, ${intensityRatio * 0.6}))`
                    : 'none'
                }}
              />

              {/* Inner warm glow when on */}
              {isOn && (
                <motion.circle
                  cx="30"
                  cy="30"
                  r="6"
                  fill={`rgba(251, 191, 36, ${intensityRatio * 0.4})`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Inner highlight - glass reflection */}
              <motion.circle
                cx="28"
                cy="28"
                r="2.5"
                fill="white"
                opacity={0.6}
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

          {/* Interactive tooltip with slider - micro-animations */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="intensity-tooltip absolute -bottom-20 left-1/2 -translate-x-1/2 
                  bg-white/10 backdrop-blur-xl 
                  px-5 py-4 rounded-2xl 
                  shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]
                  border border-white/15
                  min-w-[160px] z-50
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
                  className="absolute inset-0 rounded-2xl pointer-events-none"
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
                    className="text-sm font-light text-left mb-3 text-white/90 tracking-wider"
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
