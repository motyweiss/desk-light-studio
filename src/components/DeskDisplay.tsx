import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

// Import all 8 lighting state images
import desk000 from "@/assets/desk-000.png";
import desk001 from "@/assets/desk-001.png";
import desk010 from "@/assets/desk-010.png";
import desk011 from "@/assets/desk-011.png";
import desk100 from "@/assets/desk-100.png";
import desk101 from "@/assets/desk-101.png";
import desk110 from "@/assets/desk-110.png";
import desk111 from "@/assets/desk-111.png";

interface DeskDisplayProps {
  spotlight: boolean;
  deskLamp: boolean;
  monitorLight: boolean;
}

const lightingStates = {
  "000": desk000,
  "001": desk001,
  "010": desk010,
  "011": desk011,
  "100": desk100,
  "101": desk101,
  "110": desk110,
  "111": desk111,
};

export const DeskDisplay = ({ spotlight, deskLamp, monitorLight }: DeskDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentState, setCurrentState] = useState("000");
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animation for parallax
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 30 });

  // Calculate current lighting state
  const getCurrentState = () => {
    const spotlightBit = spotlight ? "1" : "0";
    const deskLampBit = deskLamp ? "1" : "0";
    const monitorLightBit = monitorLight ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  };

  // Update state with smooth transition
  useEffect(() => {
    const newState = getCurrentState();
    if (newState !== currentState) {
      setIsTransitioning(true);
      // Small delay to create natural lighting transition feel
      const timer = setTimeout(() => {
        setCurrentState(newState);
        setIsTransitioning(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [spotlight, deskLamp, monitorLight]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate offset from center (-1 to 1)
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);

    // Apply parallax (movement in opposite direction)
    mouseX.set(offsetX * -15);
    mouseY.set(offsetY * -10);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Calculate glow intensity based on number of lights on
  const lightsOn = [spotlight, deskLamp, monitorLight].filter(Boolean).length;
  const glowIntensity = lightsOn / 3;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-[3rem] overflow-hidden bg-container-bg shadow-2xl transition-shadow duration-700"
      style={{
        boxShadow: glowIntensity > 0 
          ? `0 0 ${40 + glowIntensity * 40}px rgba(251, 191, 36, ${0.1 + glowIntensity * 0.3}),
             0 20px 60px rgba(0, 0, 0, 0.5)`
          : '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient glow overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(251, 191, 36, ${glowIntensity * 0.1}) 0%, transparent 70%)`,
        }}
        animate={{
          opacity: glowIntensity > 0 ? 1 : 0,
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      <motion.div
        className="relative w-full h-full"
        style={{
          x: smoothX,
          y: smoothY,
        }}
      >
        {/* Stack all 8 images with smooth crossfade */}
        {Object.entries(lightingStates).map(([state, image]) => {
          const isActive = state === currentState;
          return (
            <motion.img
              key={state}
              src={image}
              alt={`Desk lighting state ${state}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isActive ? 1 : 0,
                filter: isActive ? 'brightness(1)' : 'brightness(0.95)',
              }}
              transition={{ 
                opacity: {
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1], // Smooth cubic-bezier easing
                },
                filter: {
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1],
                }
              }}
              style={{
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            />
          );
        })}
      </motion.div>
      
      {/* Transition overlay for extra smoothness */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none z-20"
        animate={{
          opacity: isTransitioning ? 0.1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
    </div>
  );
};
