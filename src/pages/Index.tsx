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
    
    // Colors extracted from actual desk image tones for each lighting state
    const stateColors: Record<string, string> = {
      "000": "220 15% 8%",    // All off - deep charcoal with slight cool undertone
      "001": "210 18% 10%",   // Monitor only - cool blue-tinted slate
      "010": "35 25% 12%",    // Desk lamp only - warm amber-brown glow
      "011": "28 22% 13%",    // Lamp + Monitor - balanced warm-cool mix
      "100": "32 20% 14%",    // Spotlight only - soft warm ceiling light
      "101": "25 18% 15%",    // Spotlight + Monitor - warm neutral with cool accent
      "110": "38 22% 16%",    // Spotlight + Lamp - rich warm golden ambiance
      "111": "30 20% 18%",    // All on - brightest warm-neutral fully lit workspace
    };
    
    return stateColors[state] || "220 15% 8%";
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
      
      {/* Monitor light ambient glow - cool blue harmony */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 75% 75% at 50% 40%, hsl(205 50% 60% / 0.10) 0%, hsl(210 45% 55% / 0.04) 38%, transparent 62%)`,
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
