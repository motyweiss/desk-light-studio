import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DeskDisplay } from "@/features/lighting/components/DeskDisplay";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Toaster } from "@/components/ui/toaster";
import { useClimate } from "@/features/climate";
import { useLighting } from "@/features/lighting";

import { useAppLoad } from "@/contexts/AppLoadContext";
import { usePageLoadSequence, LOAD_TIMING_SECONDS } from "@/hooks/usePageLoadSequence";
import { PAGE_LOAD, EASING } from "@/constants/animations";
import { PAGE_TRANSITIONS } from "@/lib/animations/tokens";

// Import primary desk image for preloading
import desk000 from "@/assets/desk-000.png";

const Index = () => {
  const { hasInitiallyLoaded, setInitiallyLoaded } = useAppLoad();
  const [isOverlayComplete, setIsOverlayComplete] = useState(hasInitiallyLoaded);
  
  // Get climate data from global context
  const climate = useClimate();

  // Get lighting state and controls from unified context
  const { lights, setLightIntensity, isConnected } = useLighting();

  // Unified page load sequence
  const { 
    stage,
    showContent, 
    showSkeleton, 
    showData,
    onOverlayExitComplete,
  } = usePageLoadSequence({
    overlayComplete: isOverlayComplete,
    isConnected,
    isDataLoaded: climate.isLoaded,
  });

  // Hover states for coordinated UI
  const [hoveredLight, setHoveredLight] = useState<string | null>(null);

  // Image preloading - only on initial load
  useEffect(() => {
    if (hasInitiallyLoaded) {
      setIsOverlayComplete(true);
      return;
    }

    // Simple approach: show overlay briefly then proceed
    const timer = setTimeout(() => {
      setIsOverlayComplete(true);
      setInitiallyLoaded();
    }, 800);

    // Also try to preload primary image
    const primaryImage = new Image();
    primaryImage.src = desk000;
    primaryImage.onload = () => {
      clearTimeout(timer);
      setIsOverlayComplete(true);
      setInitiallyLoaded();
    };
    
    return () => clearTimeout(timer);
  }, [hasInitiallyLoaded, setInitiallyLoaded]);

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
          await setLightIntensity('deskLamp', lights.deskLamp.targetValue > 0 ? 0 : 100, 'user');
          break;
        case '2':
          e.preventDefault();
          await setLightIntensity('monitorLight', lights.monitorLight.targetValue > 0 ? 0 : 100, 'user');
          break;
        case '3':
          e.preventDefault();
          await setLightIntensity('spotlight', lights.spotlight.targetValue > 0 ? 0 : 100, 'user');
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

  return (
    <>
      <LoadingOverlay 
        isLoading={stage === 'loading'} 
        onExitComplete={onOverlayExitComplete} 
      />
      <Toaster />

      <motion.div 
        className="h-full min-h-0 flex items-center justify-center p-3 md:p-8 relative"
        initial={{ opacity: 0, scale: PAGE_TRANSITIONS.scale.enter }}
        animate={{ 
          opacity: showContent ? 1 : 0,
          scale: showContent ? 1 : PAGE_TRANSITIONS.scale.enter
        }}
        transition={{ 
          duration: PAGE_TRANSITIONS.duration,
          delay: LOAD_TIMING_SECONDS.contentEntryDelay,
          ease: PAGE_TRANSITIONS.ease,
        }}
        style={{ 
          willChange: 'opacity, transform',
          transformOrigin: 'center center',
        }}
      >

        {/* Main content area */}
        <div className="w-full h-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-6 lg:gap-8 relative z-10">
          {/* Desk Display */}
          <div className="w-full md:w-[48%] lg:w-[46%] flex-shrink-0 md:order-1 order-2 max-w-[300px] md:max-w-none flex flex-col items-center">
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ 
                duration: PAGE_LOAD.elements.deskImage.duration, 
                delay: PAGE_LOAD.elements.deskImage.delay, 
                ease: EASING.entrance
              }}
              style={{ willChange: 'opacity' }}
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
          </div>

          {/* Room Info Panel */}
          <div className="w-full md:w-[48%] flex-shrink-0 md:order-2 order-1">
            <RoomInfoPanel
              roomName="Office Desk"
              climateData={{
                temperature: climate.temperature,
                humidity: climate.humidity,
                airQuality: climate.airQuality,
                isLoaded: climate.isLoaded && showData
              }}
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
                },
                {
                  id: 'keyboard',
                  name: "Magic Keyboard",
                  batteryLevel: 92,
                  isCharging: false,
                  icon: 'keyboard' as const
                },
                {
                  id: 'mouse',
                  name: "Magic Mouse",
                  batteryLevel: 78,
                  isCharging: false,
                  icon: 'mouse' as const
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
