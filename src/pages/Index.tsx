import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { DeskDisplay } from "@/components/DeskDisplay";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { AmbientGlowLayers } from "@/components/AmbientGlowLayers";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Toaster } from "@/components/ui/toaster";
import { useClimate } from "@/contexts/ClimateContext";
import { useLighting } from "@/contexts/LightingContext";
import { useAppLoad } from "@/contexts/AppLoadContext";
import { LIGHT_ANIMATION } from "@/constants/animations";

// Import all desk images for preloading
import desk000 from "@/assets/desk-000.png";
import desk001 from "@/assets/desk-001.png";
import desk010 from "@/assets/desk-010.png";
import desk011 from "@/assets/desk-011.png";
import desk100 from "@/assets/desk-100.png";
import desk101 from "@/assets/desk-101.png";
import desk110 from "@/assets/desk-110.png";
import desk111 from "@/assets/desk-111.png";

const Index = () => {
  const { hasInitiallyLoaded, setInitiallyLoaded } = useAppLoad();
  const [isLoading, setIsLoading] = useState(!hasInitiallyLoaded);
  const [isLoaded, setIsLoaded] = useState(hasInitiallyLoaded);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Get climate data from global context
  const climate = useClimate();

  // Get lighting state and controls from unified context
  const { lights, setLightIntensity, isConnected, connectionType } = useLighting();

  // Hover states for coordinated UI
  const [hoveredLight, setHoveredLight] = useState<string | null>(null);

  // Optimized image loading - only on initial load
  useEffect(() => {
    // If already loaded once, skip loading entirely
    if (hasInitiallyLoaded) {
      setIsLoading(false);
      setIsLoaded(true);
      return;
    }

    const startTime = Date.now();
    const minLoadTime = 500; // Minimum 500ms loading time
    
    // Preload the desk image
    const primaryImage = new Image();
    primaryImage.src = desk000;
    
    const checkAllLoaded = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      // Wait for minimum load time before hiding spinner
      setTimeout(() => {
        setIsLoading(false);
        
        // Coordinate state updates in single frame to prevent flashing
        requestAnimationFrame(() => {
          setIsLoaded(true);
          setInitiallyLoaded(); // Mark as initially loaded
        });
        
        // Preload remaining images in background after primary loads
        const remainingImages = [desk001, desk010, desk011, desk100, desk101, desk110, desk111];
        remainingImages.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      }, remainingTime);
    };
    
    primaryImage.onload = () => {
      checkAllLoaded();
    };
    
    // Fallback timeout in case images take too long (8 seconds max + min load time)
    const fallbackTimer = setTimeout(() => {
      checkAllLoaded();
    }, 8000 + minLoadTime);
    
    return () => clearTimeout(fallbackTimer);
  }, [hasInitiallyLoaded, setInitiallyLoaded]);

  // Master switch logic - bidirectional synchronization
  const allLightsOn = lights.spotlight.targetValue > 0 || lights.deskLamp.targetValue > 0 || lights.monitorLight.targetValue > 0;
  const masterSwitchOn = allLightsOn;

  const handleMasterToggle = useCallback(async (checked: boolean) => {
    const targetIntensity = checked ? 100 : 0;
    
    console.log(`🎛️  MASTER TOGGLE: ${checked ? 'ON' : 'OFF'} (target: ${targetIntensity}%)`);
    
    // Set all lights through unified context
    await Promise.all([
      setLightIntensity('spotlight', targetIntensity, 'user'),
      setLightIntensity('deskLamp', targetIntensity, 'user'),
      setLightIntensity('monitorLight', targetIntensity, 'user'),
    ]);
  }, [setLightIntensity]);

  // Handle individual light intensity changes
  const createLightChangeHandler = useCallback((lightId: 'spotlight' | 'deskLamp' | 'monitorLight') => {
    return async (newIntensity: number) => {
      console.log(`💡 USER CHANGE: ${lightId} → ${newIntensity}%`);
      await setLightIntensity(lightId, newIntensity, 'user');
    };
  }, [setLightIntensity]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Prevent if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '1':
          e.preventDefault();
          console.log('⌨️  Keyboard: Toggle Desk Lamp (key "1")');
          const newDeskLampIntensity = lights.deskLamp.targetValue > 0 ? 0 : 100;
          await setLightIntensity('deskLamp', newDeskLampIntensity, 'user');
          break;
        case '2':
          e.preventDefault();
          console.log('⌨️  Keyboard: Toggle Monitor Light (key "2")');
          const newMonitorIntensity = lights.monitorLight.targetValue > 0 ? 0 : 100;
          await setLightIntensity('monitorLight', newMonitorIntensity, 'user');
          break;
        case '3':
          e.preventDefault();
          console.log('⌨️  Keyboard: Toggle Spotlight (key "3")');
          const newSpotlightIntensity = lights.spotlight.targetValue > 0 ? 0 : 100;
          await setLightIntensity('spotlight', newSpotlightIntensity, 'user');
          break;
        case ' ':
          e.preventDefault(); // Prevent page scroll
          console.log('⌨️  Keyboard: Master Toggle (spacebar)');
          handleMasterToggle(!masterSwitchOn);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [masterSwitchOn, lights, handleMasterToggle, setLightIntensity]);

  // Calculate binary lighting state (on/off only, not intensity)
  const lightingState = useMemo(() => {
    const spotlightBit = lights.spotlight.targetValue > 0 ? "1" : "0";
    const deskLampBit = lights.deskLamp.targetValue > 0 ? "1" : "0";
    const monitorLightBit = lights.monitorLight.targetValue > 0 ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  }, [lights.spotlight.targetValue, lights.deskLamp.targetValue, lights.monitorLight.targetValue]);

  // Track binary state changes only (not continuous slider adjustments)
  const isFirstRenderRef = useRef(true);
  
  useEffect(() => {
    // Skip isTransitioning on first render to prevent flickering on page load
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [lightingState]);

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <Toaster />

      <div className="h-full min-h-0 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Dynamic color overlay that responds to lighting */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          animate={{
            backgroundColor: lightingState === "000" 
              ? "hsl(28 20% 18% / 0)" // All off - transparent (show base bg)
              : lightingState === "001" 
              ? "hsl(32 22% 20% / 0.15)" // Monitor only - subtle warm overlay
              : lightingState === "010"
              ? "hsl(34 24% 21% / 0.2)" // Desk lamp only - warm overlay
              : lightingState === "011"
              ? "hsl(36 25% 23% / 0.25)" // Desk + Monitor - warmer overlay
              : lightingState === "100"
              ? "hsl(35 23% 22% / 0.22)" // Spotlight only - bright warm overlay
              : lightingState === "101"
              ? "hsl(37 26% 24% / 0.28)" // Spotlight + Monitor - brighter overlay
              : lightingState === "110"
              ? "hsl(38 27% 25% / 0.3)" // Spotlight + Desk - very warm overlay
              : "hsl(40 28% 26% / 0.35)" // All on - brightest overlay
          }}
          transition={{
            duration: LIGHT_ANIMATION.turnOn.duration,
            ease: LIGHT_ANIMATION.turnOn.ease
          }}
        />

        {/* Ambient glow effects */}
        <AmbientGlowLayers
          spotlightIntensity={lights.spotlight.targetValue}
          deskLampIntensity={lights.deskLamp.targetValue}
          monitorLightIntensity={lights.monitorLight.targetValue}
          allLightsOn={allLightsOn}
        />

        {/* Main content area */}
        <div className="w-full h-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16 relative z-10">
          {/* Desk Display */}
          <motion.div
            className="w-full md:w-[42%] lg:w-[40%] flex-shrink-0 md:order-1 order-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.5, 
              ease: [0.22, 0.03, 0.26, 1]
            }}
          >
            <DeskDisplay
              spotlightIntensity={lights.spotlight.targetValue}
              deskLampIntensity={lights.deskLamp.targetValue}
              monitorLightIntensity={lights.monitorLight.targetValue}
              onSpotlightChange={createLightChangeHandler('spotlight')}
              onDeskLampChange={createLightChangeHandler('deskLamp')}
              onMonitorLightChange={createLightChangeHandler('monitorLight')}
              hoveredLightId={hoveredLight}
              isLoaded={isLoaded}
            />
          </motion.div>

          {/* Room Info Panel */}
          <motion.div
            className="w-full md:w-[52%] flex-shrink-0 md:order-2 order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.6, 
              ease: [0.22, 0.03, 0.26, 1]
            }}
          >
          <RoomInfoPanel
            roomName="Office Desk"
            devices={[
              {
                id: 'iphone',
                name: "iPhone",
                batteryLevel: climate.iphoneBatteryLevel,
                isCharging: climate.iphoneBatteryCharging,
                icon: 'smartphone' as const
              },
              {
                id: 'airpods',
                name: "AirPods Max",
                batteryLevel: climate.airpodsMaxBatteryLevel,
                isCharging: climate.airpodsMaxBatteryCharging,
                icon: 'headphones' as const
              }
            ]}
            lights={[
                {
                  id: "deskLamp",
                  label: "Desk Lamp",
                  intensity: lights.deskLamp.targetValue,
                  isPending: lights.deskLamp.isPending,
                  onChange: createLightChangeHandler('deskLamp'),
                },
                {
                  id: "monitorLight",
                  label: "Monitor Light",
                  intensity: lights.monitorLight.targetValue,
                  isPending: lights.monitorLight.isPending,
                  onChange: createLightChangeHandler('monitorLight'),
                },
                {
                  id: "spotlight",
                  label: "Spotlight",
                  intensity: lights.spotlight.targetValue,
                  isPending: lights.spotlight.isPending,
                  onChange: createLightChangeHandler('spotlight'),
                },
              ]}
              masterSwitchOn={masterSwitchOn}
              onMasterToggle={handleMasterToggle}
              onLightHover={setHoveredLight}
              isLoaded={isLoaded}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Index;
