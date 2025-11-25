import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Import all 8 lighting state images
// Naming: desk-XYZ where X=Spotlight, Y=DeskLamp, Z=MonitorLight (1=on, 0=off)
import desk000 from "@/assets/desk-000.png"; // All lights OFF
import desk001 from "@/assets/desk-001.png"; // Only Monitor Light ON
import desk010 from "@/assets/desk-010.png"; // Only Desk Lamp ON
import desk011 from "@/assets/desk-011.png"; // Desk Lamp + Monitor Light ON
import desk100 from "@/assets/desk-100-correct.png"; // Only Spotlight ON
import desk101 from "@/assets/desk-101.png"; // Spotlight + Monitor Light ON
import desk110 from "@/assets/desk-110.png"; // Spotlight + Desk Lamp ON
import desk111 from "@/assets/desk-111-correct.png"; // All lights ON - CORRECTED

interface DeskDisplayProps {
  spotlight: boolean;
  deskLamp: boolean;
  monitorLight: boolean;
}

const lightingStates: Record<string, string> = {
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
  }, [spotlight, deskLamp, monitorLight, currentState]);

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
      
      <div className="relative w-full h-full">
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
      </div>
      
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
      
      {/* Debug info - remove in production */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-xs font-mono z-30">
        State: {currentState} | S:{spotlight?'1':'0'} D:{deskLamp?'1':'0'} M:{monitorLight?'1':'0'}
      </div>
    </div>
  );
};
