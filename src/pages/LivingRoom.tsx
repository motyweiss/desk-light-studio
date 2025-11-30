import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { DeskDisplay } from "@/components/DeskDisplay";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Toaster } from "@/components/ui/toaster";
import { useClimate } from "@/contexts/ClimateContext";

// Import all desk images for preloading
import desk000 from "@/assets/desk-000.png";
import desk001 from "@/assets/desk-001.png";
import desk010 from "@/assets/desk-010.png";
import desk011 from "@/assets/desk-011.png";
import desk100 from "@/assets/desk-100.png";
import desk101 from "@/assets/desk-101.png";
import desk110 from "@/assets/desk-110.png";
import desk111 from "@/assets/desk-111.png";

const LivingRoom = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [ceilingLightIntensity, setCeilingLightIntensity] = useState(0);
  const [floorLampIntensity, setFloorLampIntensity] = useState(0);
  const [tvBacklightIntensity, setTvBacklightIntensity] = useState(0);

  const climate = useClimate();
  const [hoveredLight, setHoveredLight] = useState<string | null>(null);

  // Image preloading
  useEffect(() => {
    const startTime = Date.now();
    const minLoadTime = 500;
    
    const primaryImage = new Image();
    const backgroundImage = new Image();
    primaryImage.src = desk000;
    backgroundImage.src = '/bg.png';
    
    let primaryLoaded = false;
    let bgLoaded = false;
    
    const checkAllLoaded = () => {
      if (!primaryLoaded || !bgLoaded) return;
      
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
        
        requestAnimationFrame(() => {
          setIsLoaded(true);
          setBackgroundLoaded(true);
        });
        
        // Preload remaining images
        [desk001, desk010, desk011, desk100, desk101, desk110, desk111].forEach(src => {
          const img = new Image();
          img.src = src;
        });
      }, remainingTime);
    };
    
    primaryImage.onload = () => {
      primaryLoaded = true;
      checkAllLoaded();
    };
    
    backgroundImage.onload = () => {
      bgLoaded = true;
      checkAllLoaded();
    };
  }, []);

  const devices = useMemo(() => [
    {
      id: 'phone',
      name: "Moty's iPhone",
      batteryLevel: 85,
      isCharging: false,
      icon: 'smartphone' as const,
    },
  ], []);

  const allLightsOn = ceilingLightIntensity > 0 && floorLampIntensity > 0 && tvBacklightIntensity > 0;
  const anyLightOn = ceilingLightIntensity > 0 || floorLampIntensity > 0 || tvBacklightIntensity > 0;

  const handleMasterToggle = (checked: boolean) => {
    const targetValue = checked ? 100 : 0;
    setCeilingLightIntensity(targetValue);
    setFloorLampIntensity(targetValue);
    setTvBacklightIntensity(targetValue);
  };

  const lights = useMemo(() => [
    {
      id: 'ceiling',
      label: 'Ceiling Light',
      intensity: ceilingLightIntensity,
      onChange: setCeilingLightIntensity,
      isLoading: false,
    },
    {
      id: 'floor',
      label: 'Floor Lamp',
      intensity: floorLampIntensity,
      onChange: setFloorLampIntensity,
      isLoading: false,
    },
    {
      id: 'tv',
      label: 'TV Backlight',
      intensity: tvBacklightIntensity,
      onChange: setTvBacklightIntensity,
      isLoading: false,
    },
  ], [ceilingLightIntensity, floorLampIntensity, tvBacklightIntensity]);

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: backgroundLoaded ? 1 : 0,
        }}
        transition={{ 
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1]
        }}
        className="min-h-[100dvh] w-full relative overflow-hidden"
        style={{
          background: '#96856e',
          backgroundImage: backgroundLoaded ? 'url(/bg.png)' : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-center gap-8 md:gap-12 lg:gap-16 w-full max-w-6xl mx-auto px-6 py-10 md:py-20 min-h-[100dvh]">
          {/* Main Desk Image */}
          <motion.div
            className="w-full md:w-[42%] lg:w-[40%] flex items-center justify-center order-2 md:order-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isLoaded ? 1 : 0,
              y: isLoaded ? 0 : 30
            }}
            transition={{ 
              duration: 1,
              delay: 0,
              ease: [0.19, 1, 0.22, 1]
            }}
          >
            <DeskDisplay 
              spotlightIntensity={ceilingLightIntensity}
              deskLampIntensity={floorLampIntensity}
              monitorLightIntensity={tvBacklightIntensity}
              hoveredLightId={hoveredLight}
              isLoaded={isLoaded}
              onSpotlightChange={setCeilingLightIntensity}
              onDeskLampChange={setFloorLampIntensity}
              onMonitorLightChange={setTvBacklightIntensity}
            />
          </motion.div>

          {/* Info Panel */}
          <div className="w-full md:w-[52%] lg:w-[52%] order-1 md:order-2">
            <RoomInfoPanel
              roomName="Living Room"
              masterSwitchOn={allLightsOn || anyLightOn}
              onMasterToggle={handleMasterToggle}
              onLightHover={setHoveredLight}
              lights={lights}
              devices={devices}
              isLoaded={isLoaded}
            />
          </div>
        </div>
      </motion.div>
      
      <Toaster />
    </>
  );
};

export default LivingRoom;
