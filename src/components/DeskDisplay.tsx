import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { LightHotspot } from "./LightHotspot";
import { EASING, DURATION } from "@/constants/animations";

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
  const [previousState, setPreviousState] = useState("000");
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Count how many lights are on in a state
  const countLightsOn = (state: string) => {
    return state.split('').filter(bit => bit === '1').length;
  };

  // Calculate current lighting state based on intensity (memoized)
  const getCurrentState = useMemo(() => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  }, [spotlightIntensity, deskLampIntensity, monitorLightIntensity]);

  // Determine if we're turning on or off
  const isTurningOn = countLightsOn(currentState) > countLightsOn(previousState);

  // CRITICAL: Update state immediately when intensity changes (no delay)
  useEffect(() => {
    const newState = getCurrentState;
    if (newState !== currentState) {
      setPreviousState(currentState);
      setIsTransitioning(true);
      
      // Update state in same frame for instant visual response
      requestAnimationFrame(() => {
        setCurrentState(newState);
      });
      
      // Reset transition state after animation completes
      const lightsOnNew = countLightsOn(newState);
      const lightsOnCurrent = countLightsOn(currentState);
      const duration = lightsOnNew > lightsOnCurrent ? DURATION.lightOn : DURATION.lightOff;
      
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, duration * 1000); // Convert to milliseconds
      
      return () => clearTimeout(timer);
    }
  }, [getCurrentState, currentState]);

  // OPTIMIZED: Faster transitions for instant feedback
  const transitionDuration = useMemo(() => 
    isTurningOn ? DURATION.lightOn * 0.8 : DURATION.lightOff * 0.8 // 20% faster
  , [isTurningOn]);
  
  const transitionEasing = useMemo(() => 
    isTurningOn ? EASING.smooth : EASING.quickOut
  , [isTurningOn]);

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
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isActive && isLoaded ? 1 : 0,
                }}
                transition={{ 
                  opacity: {
                    duration: transitionDuration,
                    ease: transitionEasing,
                  },
                }}
                style={{
                  pointerEvents: isActive ? 'auto' : 'none',
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
