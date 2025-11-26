import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LightHotspot } from "./LightHotspot";

// Import all 8 lighting state images
// Naming: desk-XYZ where X=Spotlight, Y=DeskLamp, Z=MonitorLight (1=on, 0=off)
import desk000 from "@/assets/desk-000.png"; // All lights OFF
import desk001 from "@/assets/desk-001.png"; // Only Monitor Light ON
import desk010 from "@/assets/desk-010.png"; // Only Desk Lamp ON
import desk011 from "@/assets/desk-011.png"; // Desk Lamp + Monitor Light ON
import desk100 from "@/assets/desk-100.png"; // Only Spotlight ON
import desk101 from "@/assets/desk-101.png"; // Spotlight + Monitor Light ON
import desk110 from "@/assets/desk-110.png"; // Spotlight + Desk Lamp ON
import desk111 from "@/assets/desk-111.png"; // All lights ON

interface DeskDisplayProps {
  spotlightIntensity: number;
  deskLampIntensity: number;
  monitorLightIntensity: number;
  onSpotlightChange: (intensity: number) => void;
  onDeskLampChange: (intensity: number) => void;
  onMonitorLightChange: (intensity: number) => void;
  hoveredLightId: string | null;
  isLoaded: boolean;
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

export const DeskDisplay = ({ 
  spotlightIntensity, 
  deskLampIntensity, 
  monitorLightIntensity,
  onSpotlightChange,
  onDeskLampChange,
  onMonitorLightChange,
  hoveredLightId,
  isLoaded
}: DeskDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentState, setCurrentState] = useState("000");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  // Calculate current lighting state based on intensity
  const getCurrentState = () => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  };

  // Update state with smooth transition
  useEffect(() => {
    const newState = getCurrentState();
    if (newState !== currentState) {
      setCurrentState(newState);
    }
  }, [spotlightIntensity, deskLampIntensity, monitorLightIntensity, currentState]);

  // Unified easing and transition system
  const lightEasing = [0.4, 0, 0.2, 1] as const;
  const transitionDuration = {
    fast: 0.4,
    medium: 0.8,
    slow: 1.2
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        perspective: '1000px',
      }}
    >
      <motion.div 
        className="relative w-full h-full"
        animate={{
          rotateY: mousePosition.x * 8,
          rotateX: mousePosition.y * -8,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 20,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Stack all 8 images with improved crossfade */}
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
                opacity: isActive && isLoaded ? 1 : 0,
                filter: `brightness(${isActive ? 1 : 0.96})`,
              }}
              transition={{ 
                opacity: {
                  duration: transitionDuration.slow,
                  ease: lightEasing,
                },
                filter: {
                  duration: transitionDuration.slow,
                  ease: lightEasing,
                }
              }}
              style={{
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            />
          );
        })}
      </motion.div>

      {/* Interactive Light Hotspots Layer */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="relative w-full h-full pointer-events-none">
          <LightHotspot
            id="spotlight"
            label="Spotlight"
            intensity={spotlightIntensity}
            position={{ x: 79, y: 11 }}
            onIntensityChange={onSpotlightChange}
            isContainerHovered={isHovered}
            isExternallyHovered={hoveredLightId === 'spotlight'}
          />
          <LightHotspot
            id="deskLamp"
            label="Desk Lamp"
            intensity={deskLampIntensity}
            position={{ x: 25, y: 51 }}
            onIntensityChange={onDeskLampChange}
            isContainerHovered={isHovered}
            isExternallyHovered={hoveredLightId === 'deskLamp'}
          />
          <LightHotspot
            id="monitorLight"
            label="Monitor Light"
            intensity={monitorLightIntensity}
            position={{ x: 55, y: 38 }}
            onIntensityChange={onMonitorLightChange}
            isContainerHovered={isHovered}
            isExternallyHovered={hoveredLightId === 'monitorLight'}
          />
        </div>
      </div>
    </div>
  );
};
