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

const Kitchen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [overheadLightIntensity, setOverheadLightIntensity] = useState(0);
  const [counterLightIntensity, setCounterLightIntensity] = useState(0);
  const [pendantLightIntensity, setPendantLightIntensity] = useState(0);

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

  const devices = useMemo(() => [], []);

  const allLightsOn = overheadLightIntensity > 0 && counterLightIntensity > 0 && pendantLightIntensity > 0;
  const anyLightOn = overheadLightIntensity > 0 || counterLightIntensity > 0 || pendantLightIntensity > 0;

  const handleMasterToggle = (checked: boolean) => {
    const targetValue = checked ? 100 : 0;
    setOverheadLightIntensity(targetValue);
    setCounterLightIntensity(targetValue);
    setPendantLightIntensity(targetValue);
  };

  const lights = useMemo(() => [
    {
      id: 'overhead',
      label: 'Overhead Light',
      intensity: overheadLightIntensity,
      onChange: setOverheadLightIntensity,
      isLoading: false,
    },
    {
      id: 'counter',
      label: 'Counter Light',
      intensity: counterLightIntensity,
      onChange: setCounterLightIntensity,
      isLoading: false,
    },
    {
      id: 'pendant',
      label: 'Pendant Light',
      intensity: pendantLightIntensity,
      onChange: setPendantLightIntensity,
      isLoading: false,
    },
  ], [overheadLightIntensity, counterLightIntensity, pendantLightIntensity]);

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
              spotlightIntensity={overheadLightIntensity}
              deskLampIntensity={counterLightIntensity}
              monitorLightIntensity={pendantLightIntensity}
              hoveredLightId={hoveredLight}
              isLoaded={isLoaded}
              onSpotlightChange={setOverheadLightIntensity}
              onDeskLampChange={setCounterLightIntensity}
              onMonitorLightChange={setPendantLightIntensity}
            />
          </motion.div>

          {/* Info Panel */}
          <div className="w-full md:w-[52%] lg:w-[52%] order-1 md:order-2">
            <RoomInfoPanel
              roomName="Kitchen"
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

export default Kitchen;
