import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LightHotspot } from "./LightHotspot";

// Import all 8 lighting state images
// Naming: desk-XYZ where X=Spotlight, Y=DeskLamp, Z=MonitorLight (1=on, 0=off)
import desk000 from "@/assets/desk-000.png"; // All lights OFF
import desk001 from "@/assets/desk-001.png"; // Only Monitor Light ON
import desk010 from "@/assets/desk-010.png"; // Only Desk Lamp ON
import desk011 from "@/assets/desk-011.png"; // Desk Lamp + Monitor Light ON
import desk100 from "@/assets/desk-100-correct.png"; // Only Spotlight ON
import desk101 from "@/assets/desk-101-correct.png"; // Spotlight + Monitor Light ON - CORRECTED
import desk110 from "@/assets/desk-110.png"; // Spotlight + Desk Lamp ON
import desk111 from "@/assets/desk-111-correct.png"; // All lights ON - CORRECTED

interface DeskDisplayProps {
  spotlightIntensity: number;
  deskLampIntensity: number;
  monitorLightIntensity: number;
  onSpotlightChange: (intensity: number) => void;
  onDeskLampChange: (intensity: number) => void;
  onMonitorLightChange: (intensity: number) => void;
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
  onMonitorLightChange 
}: DeskDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentState, setCurrentState] = useState("000");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      setIsTransitioning(true);
      // Gentle delay for natural lighting transition
      const timer = setTimeout(() => {
        setCurrentState(newState);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [spotlightIntensity, deskLampIntensity, monitorLightIntensity, currentState]);

  // Calculate glow intensity based on average intensity
  const totalIntensity = spotlightIntensity + deskLampIntensity + monitorLightIntensity;
  const glowIntensity = totalIntensity / 300; // 0-1 scale

  // Calculate background color based on current lighting state
  const getBackgroundColor = () => {
    const state = getCurrentState();
    
    // Base dark color
    const baseDark = "220 18% 10%";
    
    // Specific colors for each state
    const stateColors: Record<string, string> = {
      "000": baseDark, // All off - pure dark
      "001": "210 25% 12%", // Monitor only - cool blue tint
      "010": "38 30% 14%", // Lamp only - warm yellow tint
      "011": "35 28% 13%", // Lamp + Monitor - balanced warm
      "100": "30 35% 13%", // Spotlight only - warm orange tint
      "101": "25 32% 12%", // Spotlight + Monitor - orange-blue mix
      "110": "35 38% 15%", // Spotlight + Lamp - bright warm
      "111": "32 40% 16%", // All on - brightest warm glow
    };
    
    return stateColors[state] || baseDark;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-1000"
      style={{
        backgroundColor: `hsl(${getBackgroundColor()})`,
        boxShadow: glowIntensity > 0 
          ? `0 0 ${40 + glowIntensity * 40}px hsla(var(--warm-glow) / ${0.1 + glowIntensity * 0.3}),
             0 20px 60px rgba(0, 0, 0, 0.5)`
          : '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic background glow layers */}
      {/* Spotlight glow - top right */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background: `radial-gradient(ellipse 45% 45% at 88% 32%, hsla(var(--spotlight-glow) / 0.25) 0%, hsla(var(--spotlight-glow) / 0.12) 30%, transparent 65%)`,
        }}
        animate={{
          opacity: spotlightIntensity / 100,
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Desk lamp glow - bottom left */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background: `radial-gradient(ellipse 40% 40% at 18% 58%, hsla(var(--lamp-glow) / 0.28) 0%, hsla(var(--lamp-glow) / 0.14) 30%, transparent 60%)`,
        }}
        animate={{
          opacity: deskLampIntensity / 100,
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Monitor light glow - center */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background: `radial-gradient(ellipse 50% 50% at 50% 32%, hsla(var(--monitor-glow) / 0.22) 0%, hsla(var(--monitor-glow) / 0.1) 35%, transparent 70%)`,
        }}
        animate={{
          opacity: monitorLightIntensity / 100,
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
                filter: isActive ? 'brightness(1) blur(0px)' : 'brightness(0.98) blur(1px)',
              }}
              transition={{ 
                opacity: {
                  duration: 1.2,
                  ease: [0.25, 0.1, 0.25, 1], // Gentle ease-in-out
                },
                filter: {
                  duration: 1,
                  ease: [0.25, 0.1, 0.25, 1],
                }
              }}
              style={{
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            />
          );
        })}
      </div>
      
      {/* Dimming overlays based on intensity */}
      {/* Spotlight dimming - darkens when intensity is low */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[15]"
        animate={{
          opacity: spotlightIntensity > 0 ? (1 - spotlightIntensity / 100) * 0.5 : 0
        }}
        style={{
          background: `radial-gradient(ellipse 35% 35% at 88% 32%, rgba(0,0,0,0.8) 0%, transparent 70%)`
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Desk lamp dimming */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[15]"
        animate={{
          opacity: deskLampIntensity > 0 ? (1 - deskLampIntensity / 100) * 0.5 : 0
        }}
        style={{
          background: `radial-gradient(ellipse 30% 30% at 18% 58%, rgba(0,0,0,0.8) 0%, transparent 65%)`
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Monitor dimming */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[15]"
        animate={{
          opacity: monitorLightIntensity > 0 ? (1 - monitorLightIntensity / 100) * 0.5 : 0
        }}
        style={{
          background: `radial-gradient(ellipse 40% 40% at 50% 32%, rgba(0,0,0,0.8) 0%, transparent 75%)`
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Transition overlay for extra smoothness */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none z-20"
        animate={{
          opacity: isTransitioning ? 0.05 : 0,
        }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1]
        }}
      />

      {/* Interactive Light Hotspots Layer */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="relative w-full h-full pointer-events-none">
          <LightHotspot
            id="spotlight"
            label="Spotlight"
            intensity={spotlightIntensity}
            position={{ x: 88, y: 32 }}
            onIntensityChange={onSpotlightChange}
            isContainerHovered={isHovered}
          />
          <LightHotspot
            id="deskLamp"
            label="Desk Lamp"
            intensity={deskLampIntensity}
            position={{ x: 18, y: 58 }}
            onIntensityChange={onDeskLampChange}
            isContainerHovered={isHovered}
          />
          <LightHotspot
            id="monitorLight"
            label="Monitor Light"
            intensity={monitorLightIntensity}
            position={{ x: 50, y: 32 }}
            onIntensityChange={onMonitorLightChange}
            isContainerHovered={isHovered}
          />
        </div>
      </div>
    </div>
  );
};
