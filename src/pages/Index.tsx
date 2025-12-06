import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { DeskDisplay } from "@/features/lighting/components/DeskDisplay";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { AmbientGlowLayers } from "@/features/lighting/components/AmbientGlowLayers";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Toaster } from "@/components/ui/toaster";
import { useClimate } from "@/features/climate";
import { useLighting } from "@/features/lighting";
import { useAppLoad } from "@/contexts/AppLoadContext";
import { usePageLoadSequence } from "@/hooks/usePageLoadSequence";
import { LIGHT_ANIMATION, PAGE_LOAD_SEQUENCE, DATA_TRANSITION, EASING } from "@/constants/animations";

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Get climate data from global context
  const climate = useClimate();

  // Get lighting state and controls from unified context
  const { lights, setLightIntensity, isConnected, connectionType } = useLighting();

  // Unified page load sequence
  const { 
    showContent, 
    showSkeleton, 
    showData,
    getStaggerDelay,
    markContentReady,
  } = usePageLoadSequence({
    overlayComplete: !isLoading,
    isConnected,
    isDataLoaded: climate.isLoaded,
  });

  // Hover states for coordinated UI
  const [hoveredLight, setHoveredLight] = useState<string | null>(null);

  // Handle overlay exit complete
  const handleOverlayExitComplete = useCallback(() => {
    markContentReady();
  }, [markContentReady]);

  // Optimized image loading - only on initial load
  useEffect(() => {
    if (hasInitiallyLoaded) {
      setIsLoading(false);
      markContentReady();
      return;
    }

    const startTime = Date.now();
    const minLoadTime = 400;
    
    const bgImage = new Image();
    bgImage.src = '/bg.png';
    
    const primaryImage = new Image();
    primaryImage.src = desk000;
    
    let bgLoaded = false;
    let deskLoaded = false;
    
    const checkAllLoaded = () => {
      if (!bgLoaded || !deskLoaded) return;
      
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
        setInitiallyLoaded();
        
        const remainingImages = [desk001, desk010, desk011, desk100, desk101, desk110, desk111];
        remainingImages.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      }, remainingTime);
    };
    
    bgImage.onload = () => { 
      bgLoaded = true; 
      checkAllLoaded(); 
    };
    
    primaryImage.onload = () => { 
      deskLoaded = true; 
      checkAllLoaded(); 
    };
    
    const fallbackTimer = setTimeout(() => {
      bgLoaded = true;
      deskLoaded = true;
      checkAllLoaded();
    }, 5000);
    
    return () => clearTimeout(fallbackTimer);
  }, [hasInitiallyLoaded, setInitiallyLoaded, markContentReady]);

  // Master switch logic
  const allLightsOn = lights.spotlight.targetValue > 0 || lights.deskLamp.targetValue > 0 || lights.monitorLight.targetValue > 0;
  const masterSwitchOn = allLightsOn;

  const handleMasterToggle = useCallback(async (checked: boolean) => {
    const targetIntensity = checked ? 100 : 0;
    
    await Promise.all([
      setLightIntensity('spotlight', targetIntensity, 'user'),
      setLightIntensity('deskLamp', targetIntensity, 'user'),
      setLightIntensity('monitorLight', targetIntensity, 'user'),
    ]);
  }, [setLightIntensity]);

  const createLightChangeHandler = useCallback((lightId: 'spotlight' | 'deskLamp' | 'monitorLight') => {
    return async (newIntensity: number) => {
      await setLightIntensity(lightId, newIntensity, 'user');
    };
  }, [setLightIntensity]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '1':
          e.preventDefault();
          const newDeskLampIntensity = lights.deskLamp.targetValue > 0 ? 0 : 100;
          await setLightIntensity('deskLamp', newDeskLampIntensity, 'user');
          break;
        case '2':
          e.preventDefault();
          const newMonitorIntensity = lights.monitorLight.targetValue > 0 ? 0 : 100;
          await setLightIntensity('monitorLight', newMonitorIntensity, 'user');
          break;
        case '3':
          e.preventDefault();
          const newSpotlightIntensity = lights.spotlight.targetValue > 0 ? 0 : 100;
          await setLightIntensity('spotlight', newSpotlightIntensity, 'user');
          break;
        case ' ':
          e.preventDefault();
          handleMasterToggle(!masterSwitchOn);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [masterSwitchOn, lights, handleMasterToggle, setLightIntensity]);

  // Calculate binary lighting state
  const lightingState = useMemo(() => {
    const spotlightBit = lights.spotlight.targetValue > 0 ? "1" : "0";
    const deskLampBit = lights.deskLamp.targetValue > 0 ? "1" : "0";
    const monitorLightBit = lights.monitorLight.targetValue > 0 ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  }, [lights.spotlight.targetValue, lights.deskLamp.targetValue, lights.monitorLight.targetValue]);

  // Track binary state changes only
  const isFirstRenderRef = useRef(true);
  
  useEffect(() => {
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

  // Unified transition config
  const smoothTransition = {
    duration: PAGE_LOAD_SEQUENCE.container.duration,
    ease: EASING.entrance,
  };

  return (
    <>
      <LoadingOverlay isLoading={isLoading} onExitComplete={handleOverlayExitComplete} />
      <Toaster />

      <motion.div 
        className="h-full min-h-0 flex items-center justify-center p-3 md:p-8 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ 
          duration: smoothTransition.duration,
          delay: PAGE_LOAD_SEQUENCE.container.delay,
          ease: smoothTransition.ease,
        }}
        style={{ willChange: 'opacity' }}
      >
        {/* Dynamic color overlay */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          initial={false}
          animate={{
            backgroundColor: lightingState === "000" 
              ? "hsl(28 20% 18% / 0)"
              : lightingState === "001" 
              ? "hsl(32 22% 20% / 0.15)"
              : lightingState === "010"
              ? "hsl(34 24% 21% / 0.2)"
              : lightingState === "011"
              ? "hsl(36 25% 23% / 0.25)"
              : lightingState === "100"
              ? "hsl(35 23% 22% / 0.22)"
              : lightingState === "101"
              ? "hsl(37 26% 24% / 0.28)"
              : lightingState === "110"
              ? "hsl(38 27% 25% / 0.3)"
              : "hsl(40 28% 26% / 0.35)"
          }}
          transition={{
            duration: LIGHT_ANIMATION.turnOn.duration,
            ease: LIGHT_ANIMATION.turnOn.ease
          }}
        />

        {/* Ambient glow effects */}
        <AmbientGlowLayers
          spotlightIntensity={showData ? lights.spotlight.targetValue : 0}
          deskLampIntensity={showData ? lights.deskLamp.targetValue : 0}
          monitorLightIntensity={showData ? lights.monitorLight.targetValue : 0}
          allLightsOn={allLightsOn}
          isLoaded={showContent && showData}
        />

        {/* Main content area */}
        <div className="w-full h-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-8 lg:gap-10 relative z-10">
          {/* Desk Display */}
          <motion.div
            className="w-full md:w-[45%] lg:w-[43%] flex-shrink-0 md:order-1 order-2 max-w-[320px] md:max-w-none"
            initial={{ opacity: 0, scale: PAGE_LOAD_SEQUENCE.deskImage.scale }}
            animate={{ 
              opacity: showContent ? 1 : 0,
              scale: showContent ? 1 : PAGE_LOAD_SEQUENCE.deskImage.scale
            }}
            transition={{ 
              duration: PAGE_LOAD_SEQUENCE.deskImage.duration, 
              delay: PAGE_LOAD_SEQUENCE.deskImage.delay, 
              ease: PAGE_LOAD_SEQUENCE.deskImage.ease
            }}
            style={{ willChange: 'opacity, transform' }}
          >
            <DeskDisplay
              spotlightIntensity={lights.spotlight.targetValue}
              deskLampIntensity={lights.deskLamp.targetValue}
              monitorLightIntensity={lights.monitorLight.targetValue}
              onSpotlightChange={createLightChangeHandler('spotlight')}
              onDeskLampChange={createLightChangeHandler('deskLamp')}
              onMonitorLightChange={createLightChangeHandler('monitorLight')}
              hoveredLightId={hoveredLight}
              isLoaded={showContent}
              dataReady={showData}
            />
          </motion.div>

          {/* Room Info Panel */}
          <div className="w-full md:w-[52%] flex-shrink-0 md:order-2 order-1">
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
              isLoaded={showContent}
              showSkeleton={showSkeleton}
              dataReady={showData}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Index;
