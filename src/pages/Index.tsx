import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun } from "lucide-react";
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
        className="min-h-[100dvh] flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
        animate={{
          backgroundColor: `hsl(${getPageBackgroundColor()})`,
        }}
        transition={{
          duration: 1.2,
          ease: [0.22, 0.03, 0.26, 1]
        }}
      >
      {/* Frosted glass blur layer for smooth background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backdropFilter: 'blur(80px)',
          WebkitBackdropFilter: 'blur(80px)',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)',
        }}
      />
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

      {/* Responsive Layout Container */}
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-7xl w-full relative z-10 pb-[120px] md:pb-0">
        {/* Mobile: Room Info Header (Title, Climate, Master Switch) */}
        <motion.div 
          className="w-full md:hidden px-[40px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 20
          }}
          transition={{ 
            duration: 0.8,
            delay: 0.3,
            ease: [0.22, 0.03, 0.26, 1]
          }}
        >
          {/* Room Title with Master Switch */}
          <div className="flex items-center justify-between mb-6">
            <motion.h1 
              className="text-4xl font-light tracking-tight text-foreground"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: isLoaded ? 1 : 0,
                y: isLoaded ? 0 : 10
              }}
              transition={{ 
                duration: 0.6,
                delay: 0.4,
                ease: [0.22, 0.03, 0.26, 1]
              }}
            >
              Office Desk
            </motion.h1>

            {/* Master Switch - Identical to desktop */}
            <motion.button
              onClick={() => handleMasterToggle(!masterSwitchOn)}
              className={`w-12 h-12 rounded-full backdrop-blur-xl border transition-all duration-500 ${
                masterSwitchOn 
                  ? 'border-[hsl(38_70%_58%/0.6)]' 
                  : 'border-white/20 hover:border-white/30'
              }`}
              whileTap={{ scale: 0.92 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isLoaded ? 1 : 0,
                scale: isLoaded ? 1 : 0.8
              }}
              transition={{ 
                duration: 0.5,
                delay: 0.6,
                ease: [0.22, 0.03, 0.26, 1]
              }}
            >
              <motion.div
                animate={{
                  color: masterSwitchOn ? 'hsl(42 75% 60%)' : 'rgba(255, 255, 255, 0.4)'
                }}
                transition={{ duration: 0.5, ease: [0.22, 0.03, 0.26, 1] }}
                className="flex items-center justify-center"
              >
                <Sun className="w-5 h-5" strokeWidth={2.5} />
              </motion.div>
            </motion.button>
          </div>

          {/* Climate Data */}
          <motion.div 
            className="flex items-center gap-12 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: isLoaded ? 1 : 0,
              y: isLoaded ? 0 : 10
            }}
            transition={{ 
              duration: 0.6,
              delay: 0.5,
              ease: [0.22, 0.03, 0.26, 1]
            }}
          >
            <div className="flex flex-col">
              <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1 font-light">Temperature</div>
              <motion.div 
                className="text-xl font-light text-foreground tabular-nums"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
              >
                24.4°
              </motion.div>
            </div>
            
            <div className="flex flex-col">
              <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1 font-light">Humidity</div>
              <motion.div 
                className="text-xl font-light text-foreground tabular-nums"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
              >
                49%
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Desk Display Panel */}
        <motion.div 
          className="w-full md:w-[50%] relative"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 20,
            scale: isLoaded ? 1 : 0.95
          }}
          transition={{ 
            duration: 0.8,
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
              duration: 0.8,
              delay: 0.6,
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

        {/* Room Info Panel - Full on desktop, Light cards only on mobile */}
        <motion.div 
          className="w-full md:w-[42%] md:pl-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 20
          }}
          transition={{ 
            duration: 0.8,
            delay: 0.5,
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
                label: 'Monitor Back Light', 
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
