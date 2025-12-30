import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DeskDisplay } from "@/features/lighting/components/DeskDisplay";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Toaster } from "@/components/ui/toaster";
import { useClimate } from "@/features/climate";
import { useLighting } from "@/features/lighting";
import { useAppLoad } from "@/contexts/AppLoadContext";
import { usePageLoadSequence, LOAD_EASE } from "@/hooks/usePageLoadSequence";
import { LOAD_SEQUENCE } from "@/constants/loadingSequence";

// Import primary desk image for preloading
import desk000 from "@/assets/desk-000.png";

const Index = () => {
  const { hasInitiallyLoaded, setInitiallyLoaded } = useAppLoad();
  const [isOverlayComplete, setIsOverlayComplete] = useState(hasInitiallyLoaded);
  
  const climate = useClimate();
  const { lights, setLightIntensity, isConnected } = useLighting();

  const { 
    stage,
    showOverlay,
    showContent, 
    showSkeleton, 
    showData,
    showMediaPlayer,
    onOverlayExitComplete,
  } = usePageLoadSequence({
    overlayComplete: isOverlayComplete,
    isConnected,
    isDataLoaded: climate.isLoaded,
  });

  const [hoveredLight, setHoveredLight] = useState<string | null>(null);

  // Preload image and complete overlay
  useEffect(() => {
    if (hasInitiallyLoaded) {
      setIsOverlayComplete(true);
      return;
    }

    const timeout = setTimeout(() => {
      setIsOverlayComplete(true);
      setInitiallyLoaded();
    }, 600);

    const img = new Image();
    img.src = desk000;
    img.onload = () => {
      clearTimeout(timeout);
      setIsOverlayComplete(true);
      setInitiallyLoaded();
    };
    
    return () => clearTimeout(timeout);
  }, [hasInitiallyLoaded, setInitiallyLoaded]);

  // Master switch
  const allLightsOn = lights.spotlight.targetValue > 0 || lights.deskLamp.targetValue > 0 || lights.monitorLight.targetValue > 0;

  const handleMasterToggle = useCallback(async (checked: boolean) => {
    const intensity = checked ? 100 : 0;
    await Promise.all([
      setLightIntensity('spotlight', intensity, 'user'),
      setLightIntensity('deskLamp', intensity, 'user'),
      setLightIntensity('monitorLight', intensity, 'user'),
    ]);
  }, [setLightIntensity]);

  const createLightHandler = useCallback((id: 'spotlight' | 'deskLamp' | 'monitorLight') => {
    return (value: number) => setLightIntensity(id, value, 'user');
  }, [setLightIntensity]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const actions: Record<string, () => void> = {
        '1': () => setLightIntensity('deskLamp', lights.deskLamp.targetValue > 0 ? 0 : 100, 'user'),
        '2': () => setLightIntensity('monitorLight', lights.monitorLight.targetValue > 0 ? 0 : 100, 'user'),
        '3': () => setLightIntensity('spotlight', lights.spotlight.targetValue > 0 ? 0 : 100, 'user'),
        ' ': () => handleMasterToggle(!allLightsOn),
      };

      if (actions[e.key]) {
        e.preventDefault();
        actions[e.key]();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [allLightsOn, lights, handleMasterToggle, setLightIntensity]);

  return (
    <>
      <LoadingOverlay 
        isLoading={showOverlay} 
        onExitComplete={onOverlayExitComplete} 
      />
      <Toaster />

      <motion.div 
        className="h-full min-h-0 flex items-center justify-center p-3 md:p-8 relative"
        initial={{ opacity: 0, scale: LOAD_SEQUENCE.content.scaleFrom }}
        animate={{ 
          opacity: showContent ? 1 : 0,
          scale: showContent ? 1 : LOAD_SEQUENCE.content.scaleFrom,
        }}
        transition={{ 
          duration: LOAD_SEQUENCE.content.duration,
          delay: LOAD_SEQUENCE.content.delay,
          ease: LOAD_EASE.content,
        }}
      >
        <div className="w-full h-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-6 lg:gap-8 relative z-10">
          {/* Desk Display */}
          <div className="w-full md:w-[48%] lg:w-[46%] flex-shrink-0 md:order-1 order-2 max-w-[300px] md:max-w-none flex flex-col items-center">
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ 
                duration: LOAD_SEQUENCE.elements.deskImage.duration, 
                delay: LOAD_SEQUENCE.elements.deskImage.delay,
                ease: LOAD_EASE.content,
              }}
            >
              <DeskDisplay
                spotlightIntensity={lights.spotlight.targetValue}
                deskLampIntensity={lights.deskLamp.targetValue}
                monitorLightIntensity={lights.monitorLight.targetValue}
                onSpotlightChange={createLightHandler('spotlight')}
                onDeskLampChange={createLightHandler('deskLamp')}
                onMonitorLightChange={createLightHandler('monitorLight')}
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
                isLoaded: climate.isLoaded && showData,
              }}
              devices={[
                { id: 'iphone', name: "iPhone", batteryLevel: climate.iphoneBatteryLevel, isCharging: climate.iphoneBatteryCharging, icon: 'smartphone' as const },
                { id: 'airpods', name: "AirPods Max", batteryLevel: climate.airpodsMaxBatteryLevel, isCharging: climate.airpodsMaxBatteryCharging, icon: 'headphones' as const },
                { id: 'keyboard', name: "Magic Keyboard", batteryLevel: 92, isCharging: false, icon: 'keyboard' as const },
                { id: 'mouse', name: "Magic Mouse", batteryLevel: 78, isCharging: false, icon: 'mouse' as const },
              ]}
              lights={[
                { id: "deskLamp", label: "Desk Lamp", intensity: lights.deskLamp.targetValue, isPending: lights.deskLamp.isPending, onChange: createLightHandler('deskLamp') },
                { id: "monitorLight", label: "Monitor Light", intensity: lights.monitorLight.targetValue, isPending: lights.monitorLight.isPending, onChange: createLightHandler('monitorLight') },
                { id: "spotlight", label: "Spotlight", intensity: lights.spotlight.targetValue, isPending: lights.spotlight.isPending, onChange: createLightHandler('spotlight') },
              ]}
              masterSwitchOn={allLightsOn}
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
