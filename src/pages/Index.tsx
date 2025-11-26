import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DeskDisplay } from "@/components/DeskDisplay";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [spotlightIntensity, setSpotlightIntensity] = useState(0); // 0-100
  const [deskLampIntensity, setDeskLampIntensity] = useState(0);
  const [monitorLightIntensity, setMonitorLightIntensity] = useState(0);

  // Hover states for coordinated UI
  const [hoveredLight, setHoveredLight] = useState<string | null>(null);

  // Initial loading phase - wait for assets to load
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      // Small delay before starting entrance animations
      setTimeout(() => {
        setIsLoaded(true);
      }, 100);
    }, 2000); // Loading phase duration

    return () => clearTimeout(loadingTimer);
  }, []);

  // Master switch logic - bidirectional synchronization
  const allLightsOn = spotlightIntensity > 0 || deskLampIntensity > 0 || monitorLightIntensity > 0;
  const masterSwitchOn = allLightsOn;

  const handleMasterToggle = (checked: boolean) => {
    const targetIntensity = checked ? 100 : 0;
    setSpotlightIntensity(targetIntensity);
    setDeskLampIntensity(targetIntensity);
    setMonitorLightIntensity(targetIntensity);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '1':
          // Toggle Desk Lamp
          setDeskLampIntensity(prev => prev > 0 ? 0 : 100);
          break;
        case '2':
          // Toggle Monitor Light
          setMonitorLightIntensity(prev => prev > 0 ? 0 : 100);
          break;
        case '3':
          // Toggle Spotlight
          setSpotlightIntensity(prev => prev > 0 ? 0 : 100);
          break;
        case ' ':
          // Master toggle with spacebar
          e.preventDefault(); // Prevent page scroll
          handleMasterToggle(!masterSwitchOn);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [masterSwitchOn]);

  // Calculate page background color based on light intensities
  const getPageBackgroundColor = () => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    const state = `${spotlightBit}${deskLampBit}${monitorLightBit}`;
    
    // All warm colors matching desk image tones - no cool/blue tones
    const stateColors: Record<string, string> = {
      "000": "25 20% 6%",     // All off - very dark warm brown, cozy darkness
      "001": "28 18% 11%",    // Monitor only - warm slate brown
      "010": "35 25% 12%",    // Desk lamp only - warm amber-brown glow
      "011": "32 22% 14%",    // Lamp + Monitor - warm balanced mix
      "100": "32 20% 14%",    // Spotlight only - soft warm ceiling light
      "101": "30 19% 15%",    // Spotlight + Monitor - warm neutral
      "110": "38 22% 16%",    // Spotlight + Lamp - rich warm golden ambiance
      "111": "34 20% 18%",    // All on - brightest warm workspace
    };
    
    return stateColors[state] || "25 20% 6%";
  };

  return (
    <>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 0.03, 0.26, 1] }}
            style={{
              backgroundColor: 'hsl(25 18% 10%)',
            }}
          >
            {/* Subtle breathing pulse */}
            <motion.div
              className="w-16 h-16 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(42 70% 55% / 0.15) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden"
        animate={{
          backgroundColor: `hsl(${getPageBackgroundColor()})`,
        }}
        transition={{
          duration: 1.2,
          ease: [0.22, 0.03, 0.26, 1]
        }}
      >
      {/* Enhanced ambient page glow layers - synchronized positions with soft spill */}
      
      {/* Spotlight ambient glow - warm subtle orange */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 35%, hsl(25 60% 50% / 0.12) 0%, hsl(30 55% 45% / 0.05) 30%, transparent 60%)`,
          filter: 'blur(70px)',
        }}
        animate={{
          opacity: Math.pow(spotlightIntensity / 100, 0.8),
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Desk lamp ambient glow - soft warm gold */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 65% 65% at 30% 55%, hsl(42 70% 55% / 0.11) 0%, hsl(40 65% 50% / 0.04) 35%, transparent 58%)`,
          filter: 'blur(65px)',
        }}
        animate={{
          opacity: Math.pow(deskLampIntensity / 100, 0.8),
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Monitor light ambient glow - warm beige harmony */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 75% 75% at 50% 40%, hsl(38 45% 55% / 0.10) 0%, hsl(35 40% 50% / 0.04) 38%, transparent 62%)`,
          filter: 'blur(60px)',
        }}
        animate={{
          opacity: Math.pow(monitorLightIntensity / 100, 0.8),
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />

      {/* Two-Column Layout Container */}
      <div className="flex items-center gap-12 max-w-7xl w-full relative z-10">
        {/* Left Panel - Desk Display */}
        <motion.div 
          className="w-[55%] relative"
          initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(8px)" }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 30,
            scale: isLoaded ? 1 : 0.95,
            filter: isLoaded ? "blur(0px)" : "blur(8px)"
          }}
          transition={{ 
            duration: 1,
            delay: 0.4,
            ease: [0.22, 0.03, 0.26, 1]
          }}
        >
          {/* Lighting effect layers beneath image */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Spotlight glow - warm orange from top center */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-0 w-[60%] h-[50%]"
              style={{
                background: 'radial-gradient(ellipse 100% 100% at 50% 0%, hsl(32 85% 55% / 0.25) 0%, hsl(35 80% 50% / 0.12) 35%, transparent 70%)',
                filter: 'blur(40px)',
              }}
              animate={{
                opacity: Math.pow(spotlightIntensity / 100, 0.9),
              }}
              transition={{
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1]
              }}
            />

            {/* Desk lamp glow - warm golden from left side */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[50%] h-[60%]"
              style={{
                background: 'radial-gradient(ellipse 100% 100% at 0% 50%, hsl(42 90% 58% / 0.28) 0%, hsl(40 85% 52% / 0.14) 38%, transparent 72%)',
                filter: 'blur(45px)',
              }}
              animate={{
                opacity: Math.pow(deskLampIntensity / 100, 0.9),
              }}
              transition={{
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1]
              }}
            />

            {/* Monitor light glow - warm beige from center */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-1/3 w-[55%] h-[45%]"
              style={{
                background: 'radial-gradient(ellipse 100% 100% at 50% 40%, hsl(38 70% 60% / 0.22) 0%, hsl(35 65% 55% / 0.11) 40%, transparent 75%)',
                filter: 'blur(35px)',
              }}
              animate={{
                opacity: Math.pow(monitorLightIntensity / 100, 0.9),
              }}
              transition={{
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1]
              }}
            />
          </div>

          {/* Soft shadow layer underneath image */}
          <motion.div 
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-[12%] pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ 
              duration: 1.2,
              delay: 1.0,
              ease: [0.22, 0.03, 0.26, 1]
            }}
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 50%, transparent 80%)',
              filter: 'blur(25px)',
            }}
          />
          <DeskDisplay
            spotlightIntensity={spotlightIntensity}
            deskLampIntensity={deskLampIntensity}
            monitorLightIntensity={monitorLightIntensity}
            onSpotlightChange={setSpotlightIntensity}
            onDeskLampChange={setDeskLampIntensity}
            onMonitorLightChange={setMonitorLightIntensity}
            hoveredLightId={hoveredLight}
            isLoaded={isLoaded}
          />
        </motion.div>

        {/* Right Panel - Room Info */}
        <motion.div 
          className="w-[40%]"
          initial={{ opacity: 0, x: 30 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            x: isLoaded ? 0 : 30
          }}
          transition={{ 
            duration: 1,
            delay: 0.8,
            ease: [0.22, 0.03, 0.26, 1]
          }}
        >
          <RoomInfoPanel
            roomName="Office Desk"
            temperature={24.4}
            humidity={49}
            masterSwitchOn={masterSwitchOn}
            onMasterToggle={handleMasterToggle}
            onLightHover={setHoveredLight}
            lights={[
              { 
                id: 'deskLamp', 
                label: 'Desk Lamp', 
                intensity: deskLampIntensity, 
                onChange: setDeskLampIntensity 
              },
              { 
                id: 'monitorLight', 
                label: 'Monitor Light', 
                intensity: monitorLightIntensity, 
                onChange: setMonitorLightIntensity 
              },
              { 
                id: 'spotlight', 
                label: 'Spotlight', 
                intensity: spotlightIntensity, 
                onChange: setSpotlightIntensity 
              },
            ]}
            isLoaded={isLoaded}
          />
        </motion.div>
      </div>
      </motion.div>
    </>
  );
};

export default Index;
