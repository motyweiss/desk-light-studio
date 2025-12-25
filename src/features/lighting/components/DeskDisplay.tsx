import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { LightHotspot } from "./LightHotspot";
import { LIGHT_ANIMATION } from "@/constants/animations";

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
  spotlightIntensity: number;
  deskLampIntensity: number;
  monitorLightIntensity: number;
  onSpotlightChange: (intensity: number) => void;
  onDeskLampChange: (intensity: number) => void;
  onMonitorLightChange: (intensity: number) => void;
  hoveredLightId: string | null;
  isLoaded: boolean;
  dataReady?: boolean;
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
  isLoaded,
  dataReady = true
}: DeskDisplayProps) => {
  // Calculate state from props
  const getStateFromIntensities = useCallback(() => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  }, [spotlightIntensity, deskLampIntensity, monitorLightIntensity]);

  const [currentState, setCurrentState] = useState("000");
  const [previousState, setPreviousState] = useState("000");
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  // Mark ready immediately when loaded and data is available
  useEffect(() => {
    if (isLoaded && dataReady && !isReady) {
      setIsReady(true);
    }
  }, [isLoaded, dataReady, isReady]);

  // Spring animations for smooth parallax effect
  const springConfig = { stiffness: 100, damping: 25, mass: 0.5 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);
  
  // Transform mouse position to rotation and translation
  const rotateX = useTransform(mouseY, [-1, 1], [4, -4]);
  const rotateY = useTransform(mouseX, [-1, 1], [-4, 4]);
  const translateX = useTransform(mouseX, [-1, 1], [-8, 8]);
  const translateY = useTransform(mouseY, [-1, 1], [-8, 8]);
  const scale = useTransform(
    mouseX,
    [-1, 0, 1],
    [1.02, 1, 1.02]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normalizedX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const normalizedY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  }, [mouseX, mouseY]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  // Count lights on
  const countLightsOn = (state: string) => state.split('').filter(bit => bit === '1').length;

  // Determine if turning on or off
  const isTurningOn = countLightsOn(currentState) > countLightsOn(previousState);

  // Update state when intensities change - only animate after ready
  useEffect(() => {
    const newState = getStateFromIntensities();
    
    // Before ready, just snap to state without animation
    if (!isReady) {
      setCurrentState(newState);
      setPreviousState(newState);
      return;
    }
    
    if (newState !== currentState) {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      setPreviousState(currentState);
      setCurrentState(newState);
      setIsTransitioning(true);
      
      const lightsOnNew = countLightsOn(newState);
      const lightsOnCurrent = countLightsOn(currentState);
      const animConfig = lightsOnNew > lightsOnCurrent ? LIGHT_ANIMATION.turnOn : LIGHT_ANIMATION.turnOff;
      
      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
      }, animConfig.duration * 1000);
    }
    
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [getStateFromIntensities, currentState, isReady]);

  // Transition config based on direction
  const transitionConfig = useMemo(() => {
    const config = isTurningOn ? LIGHT_ANIMATION.turnOn : LIGHT_ANIMATION.turnOff;
    return {
      duration: config.duration,
      ease: config.ease,
    };
  }, [isTurningOn]);

  return (
    <div
      className="relative w-full aspect-square"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <motion.div 
        className="relative w-full h-full overflow-hidden rounded-[2rem]"
        style={{
          perspective: 1200,
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            rotateX,
            rotateY,
            x: translateX,
            y: translateY,
            scale,
            transformStyle: 'preserve-3d',
          }}
        >
        {/* Gradient mask overlay */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            maskImage: `radial-gradient(ellipse 92% 92% at 50% 50%, black 60%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse 92% 92% at 50% 50%, black 60%, transparent 100%)`,
          }}
        />
        
        {/* Image stack */}
        <div 
          className="absolute inset-0"
          style={{
            maskImage: `linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)`,
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          {Object.entries(lightingStates).map(([state, image]) => {
            const isActive = state === currentState;
            const wasPrevious = state === previousState;
            const showAsPrevious = isTransitioning && wasPrevious && !isActive;
            
            let targetOpacity = 0;
            if (isActive && isLoaded) {
              targetOpacity = 1;
            } else if (showAsPrevious) {
              targetOpacity = 0;
            }
            
            // Only animate if ready, otherwise snap
            const shouldAnimate = isReady && (isActive || showAsPrevious);
            const animDuration = shouldAnimate ? transitionConfig.duration : 0;
            
            return (
              <motion.img
                key={state}
                src={image}
                alt={`Desk lighting state ${state}`}
                className="absolute inset-0 w-full h-full object-cover"
                initial={false}
                animate={{ 
                  opacity: targetOpacity,
                  zIndex: isActive ? 10 : showAsPrevious ? 5 : 1,
                }}
                transition={{ 
                  opacity: {
                    duration: animDuration,
                    ease: transitionConfig.ease,
                  },
                  zIndex: { duration: 0 }
                }}
                style={{
                  pointerEvents: isActive ? 'auto' : 'none',
                  willChange: 'opacity',
                }}
                loading="eager"
                decoding="async"
              />
            );
          })}
        </div>
        </motion.div>
      </motion.div>

      {/* Hotspots - Desktop Only */}
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
