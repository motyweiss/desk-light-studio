import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { LightHotspot } from "./LightHotspot";
import { LIGHT_ANIMATION } from "@/constants/animations";

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

// Preload all images and track loading state
const preloadImages = (images: Record<string, string>): Promise<void[]> => {
  return Promise.all(
    Object.values(images).map(src => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Resolve even on error to not block
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
  isLoaded
}: DeskDisplayProps) => {
  const [currentState, setCurrentState] = useState("000");
  const [previousState, setPreviousState] = useState("000");
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const loadedImagesRef = useRef<Set<string>>(new Set());

  // Preload all images on mount
  useEffect(() => {
    preloadImages(lightingStates).then(() => {
      setAllImagesLoaded(true);
    });
  }, []);

  // Spring animations for smooth 3D parallax effect
  const springConfig = { stiffness: 150, damping: 20 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  // Transform to rotation values (subtle ±3 degrees max)
  const rotateX = useTransform(y, [-1, 1], [3, -3]);
  const rotateY = useTransform(x, [-1, 1], [-3, 3]);

  // Mouse move handler for parallax effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalize to -1 to 1 range
    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);
    
    x.set(normalizedX);
    y.set(normalizedY);
  }, [x, y]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
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

  // Track individual image load state
  const handleImageLoad = useCallback((state: string) => {
    loadedImagesRef.current.add(state);
  }, []);

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
      const animConfig = lightsOnNew > lightsOnCurrent ? LIGHT_ANIMATION.turnOn : LIGHT_ANIMATION.turnOff;
      
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, animConfig.duration * 1000); // Convert to milliseconds
      
      return () => clearTimeout(timer);
    }
  }, [getCurrentState, currentState]);

  // Unified transition timing - same as all other components
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
        {/* Stack all 8 images - all rendered and loaded, only opacity changes */}
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
          {/* Base layer - always show current state image at opacity 1 underneath */}
          {Object.entries(lightingStates).map(([state, image]) => {
            const isActive = state === currentState;
            const wasPrevious = state === previousState;
            
            // During transition: show previous at full opacity, animate current on top
            // After transition: show current at full opacity
            const shouldShowAsPrevious = isTransitioning && wasPrevious && !isActive;
            const shouldAnimate = isActive;
            
            return (
              <motion.img
                key={state}
                src={image}
                alt={`Desk lighting state ${state}`}
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={() => handleImageLoad(state)}
                initial={false}
                animate={{ 
                  opacity: shouldShowAsPrevious 
                    ? 1 
                    : shouldAnimate && isLoaded && allImagesLoaded 
                      ? 1 
                      : 0,
                  zIndex: shouldAnimate ? 10 : shouldShowAsPrevious ? 5 : 1,
                }}
                transition={{ 
                  opacity: {
                    duration: shouldAnimate ? transitionConfig.duration : 0,
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