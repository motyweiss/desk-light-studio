import { useState, useEffect } from "react";
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
  const [currentState, setCurrentState] = useState("000");
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Calculate current lighting state based on intensity
  const getCurrentState = () => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  };

  // Update state with smooth transition and transition indicator
  useEffect(() => {
    const newState = getCurrentState();
    if (newState !== currentState) {
      setIsTransitioning(true);
      setCurrentState(newState);
      
      // Reset transition state after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [spotlightIntensity, deskLampIntensity, monitorLightIntensity, currentState]);

  // Unified easing and transition system for smooth crossfades
  const lightEasing = [0.25, 0.1, 0.25, 1] as const;
  const transitionDuration = {
    fast: 0.5,
    medium: 1.0,
    slow: 2.0
  };

  return (
    <div
      className="relative w-full aspect-square"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-full overflow-hidden rounded-[2rem]">
        {/* Gradient mask overlay for smooth fade out to background */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            maskImage: `
              radial-gradient(
                ellipse 92% 92% at 50% 50%,
                black 60%,
                transparent 100%
              )
            `,
            WebkitMaskImage: `
              radial-gradient(
                ellipse 92% 92% at 50% 50%,
                black 60%,
                transparent 100%
              )
            `,
          }}
        />
        {/* Stack all 8 images with smooth crossfade transitions */}
        <div 
          className="absolute inset-0"
          style={{
            maskImage: `
              linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%),
              linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)
            `,
            WebkitMaskImage: `
              linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%),
              linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)
            `,
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          {Object.entries(lightingStates).map(([state, image]) => {
            const isActive = state === currentState;
            return (
              <motion.img
                key={state}
                src={image}
                alt={`Desk lighting state ${state}`}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.01 }}
                animate={{ 
                  opacity: isActive && isLoaded ? 1 : 0,
                  scale: isActive && isLoaded ? 1 : 1.01,
                }}
                transition={{ 
                  opacity: {
                    duration: transitionDuration.slow,
                    ease: lightEasing,
                  },
                  scale: {
                    duration: transitionDuration.slow,
                    ease: lightEasing,
                  }
                }}
                style={{
                  pointerEvents: isActive ? 'auto' : 'none',
                  willChange: 'opacity, transform',
                }}
              />
            );
          })}
        </div>
        
      </div>

      {/* Interactive Light Hotspots Layer - Desktop Only */}
      <div className="hidden md:block absolute inset-0 z-30 pointer-events-none">
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
            label="Monitor Back Light"
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
