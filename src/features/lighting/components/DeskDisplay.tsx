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

// Preload all images
const preloadImages = (images: Record<string, string>): Promise<void[]> => {
  return Promise.all(
    Object.values(images).map(src => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });
    })
  );
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
  // Calculate initial state from props
  const getStateFromIntensities = useCallback(() => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  }, [spotlightIntensity, deskLampIntensity, monitorLightIntensity]);

  const [currentState, setCurrentState] = useState("000"); // Always start with lights off
  const [previousState, setPreviousState] = useState("000");
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [hasInitialRender, setHasInitialRender] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  // Preload all images on mount
  useEffect(() => {
    preloadImages(lightingStates).then(() => {
      setAllImagesLoaded(true);
    });
  }, []);

  // Mark initial render complete when loaded and images ready
  useEffect(() => {
    if (isLoaded && allImagesLoaded) {
      queueMicrotask(() => {
        setHasInitialRender(true);
      });
    }
  }, [isLoaded, allImagesLoaded]);

  // Spring animations for parallax effect
  const springConfig = { stiffness: 150, damping: 20 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const rotateX = useTransform(y, [-1, 1], [3, -3]);
  const rotateY = useTransform(x, [-1, 1], [-3, 3]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);
    x.set(normalizedX);
    y.set(normalizedY);
  }, [x, y]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  // Count lights on
  const countLightsOn = (state: string) => state.split('').filter(bit => bit === '1').length;

  // Determine if turning on or off
  const isTurningOn = countLightsOn(currentState) > countLightsOn(previousState);

  // Update state when intensities change - animate only after initial render AND data is ready
  useEffect(() => {
    const newState = getStateFromIntensities();
    
    // During initial load or before data is ready, update state immediately without animation
    if (!hasInitialRender || !dataReady) {
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
  }, [getStateFromIntensities, currentState, hasInitialRender, dataReady]);

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
          perspective: 1000,
          rotateX,
          rotateY,
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
            
            // Show "000" immediately on load, then transition to actual state
            let targetOpacity = 0;
            if (isActive && isLoaded && allImagesLoaded) {
              targetOpacity = 1;
            } else if (showAsPrevious) {
              targetOpacity = 1;
            }
            
            // Instant for initial render, animated for subsequent changes
            const animDuration = hasInitialRender && dataReady && isActive ? transitionConfig.duration : 0;
            
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
