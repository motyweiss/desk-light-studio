import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Sun, Thermometer, Droplets } from "lucide-react";
import { DeskDisplay } from "@/components/DeskDisplay";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { AmbientGlowLayers } from "@/components/AmbientGlowLayers";

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
    }, 3000); // Loading phase duration

    return () => clearTimeout(loadingTimer);
  }, []);

  // Master switch logic - bidirectional synchronization
  const allLightsOn = spotlightIntensity > 0 || deskLampIntensity > 0 || monitorLightIntensity > 0;
  const masterSwitchOn = allLightsOn;

  const handleMasterToggle = useCallback((checked: boolean) => {
    const targetIntensity = checked ? 100 : 0;
    setSpotlightIntensity(targetIntensity);
    setDeskLampIntensity(targetIntensity);
    setMonitorLightIntensity(targetIntensity);
  }, []);

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

  // Calculate page background color based on light intensities - memoized for performance
  const pageBackgroundColor = useMemo(() => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    const state = `${spotlightBit}${deskLampBit}${monitorLightBit}`;
    
    // All warm colors matching desk image tones - darker for better contrast
    const stateColors: Record<string, string> = {
      "000": "28 20% 18%",     // All off - warm dark brown
      "001": "30 22% 22%",     // Monitor only - warm slate brown
      "010": "35 28% 24%",     // Desk lamp only - warm golden brown
      "011": "32 25% 26%",     // Lamp + Monitor - warm balanced tan
      "100": "30 24% 25%",     // Spotlight only - soft warm brown
      "101": "32 23% 28%",     // Spotlight + Monitor - warm neutral
      "110": "36 26% 30%",     // Spotlight + Lamp - rich warm ochre
      "111": "34 24% 32%",     // All on - brightest warm workspace
    };
    
    return stateColors[state] || "28 20% 18%";
  }, [spotlightIntensity, deskLampIntensity, monitorLightIntensity]);

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />

      <motion.div 
        className="min-h-[100dvh] flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
        animate={{
          backgroundColor: `hsl(${pageBackgroundColor})`,
        }}
        transition={{
          duration: 1.5,
          ease: [0.22, 0.03, 0.26, 1]
        }}
      >
      {/* Frosted glass blur layer for smooth background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backdropFilter: 'blur(80px)',
          WebkitBackdropFilter: 'blur(80px)',
          background: 'linear-gradient(135deg, hsl(38 15% 45% / 0.03) 0%, hsl(35 12% 42% / 0.05) 100%)',
        }}
      />
      
      <AmbientGlowLayers
        spotlightIntensity={spotlightIntensity}
        deskLampIntensity={deskLampIntensity}
        monitorLightIntensity={monitorLightIntensity}
        allLightsOn={allLightsOn}
      />

      {/* Responsive Layout Container */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-16 max-w-7xl w-full relative z-10 px-5 md:px-0 pb-20 md:pb-0">
        {/* Mobile: Room Info Header (Title, Climate, Master Switch) */}
        <motion.div 
          className="w-full md:hidden pt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 30
          }}
          transition={{ 
            duration: 0.8,
            delay: 0.2,
            ease: [0.22, 0.03, 0.26, 1]
          }}
        >
          {/* Room Title with Master Switch */}
          <div className="flex items-start justify-between mb-5">
            <motion.h1 
              className="text-[2.5rem] font-light tracking-tight text-foreground leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
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
              Office Desk
            </motion.h1>

            {/* Master Switch - Identical to desktop */}
            <motion.button
              onClick={() => handleMasterToggle(!masterSwitchOn)}
              className={`w-12 h-12 rounded-full backdrop-blur-xl border-2 transition-all duration-500 flex-shrink-0 ${
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
                duration: 0.6,
                delay: 0.5,
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
                <Sun className="w-5 h-5" strokeWidth={2} />
              </motion.div>
            </motion.button>
          </div>

          {/* Climate Data */}
          <motion.div 
            className="flex gap-10 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isLoaded ? 1 : 0,
              y: isLoaded ? 0 : 20
            }}
            transition={{ 
              duration: 0.8,
              delay: 0.4,
              ease: [0.22, 0.03, 0.26, 1]
            }}
          >
            {/* Temperature */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm">
                <Thermometer className="w-5 h-5 text-white/50" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 mb-0.5 font-light">Temperature</div>
                <motion.div 
                  className="text-lg font-light text-foreground tabular-nums"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoaded ? 1 : 0 }}
                >
                  21°
                </motion.div>
              </div>
            </div>
            
            {/* Humidity */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm">
                <Droplets className="w-5 h-5 text-white/50" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 mb-0.5 font-light">Humidity</div>
                <motion.div 
                  className="text-lg font-light text-foreground tabular-nums"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoaded ? 1 : 0 }}
                >
                  49%
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Desk Display Panel */}
        <motion.div 
          className="w-full md:w-[50%] relative"
          initial={{ opacity: 0, y: 40, scale: 0.92, filter: 'blur(10px)' }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 40,
            scale: isLoaded ? 1 : 0.92,
            filter: isLoaded ? 'blur(0px)' : 'blur(10px)'
          }}
          transition={{ 
            duration: 1.2,
            delay: 0.3,
            ease: [0.22, 0.03, 0.26, 1]
          }}
        >
          {/* Lighting effect layers beneath image */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Spotlight glow - warm golden orange from top center */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-0 w-[60%] h-[50%]"
              style={{
                background: 'radial-gradient(ellipse 100% 100% at 50% 0%, hsl(38 85% 62% / 0.30) 0%, hsl(40 80% 58% / 0.15) 35%, transparent 70%)',
                filter: 'blur(40px)',
              }}
              animate={{
                opacity: Math.pow(spotlightIntensity / 100, 0.9),
              }}
              transition={{
                duration: 1.5,
                ease: [0.22, 0.03, 0.26, 1]
              }}
            />

            {/* Desk lamp glow - rich warm golden from left side */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[50%] h-[60%]"
              style={{
                background: 'radial-gradient(ellipse 100% 100% at 0% 50%, hsl(42 90% 65% / 0.35) 0%, hsl(43 85% 60% / 0.18) 38%, transparent 72%)',
                filter: 'blur(45px)',
              }}
              animate={{
                opacity: Math.pow(deskLampIntensity / 100, 0.9),
              }}
              transition={{
                duration: 1.5,
                ease: [0.22, 0.03, 0.26, 1]
              }}
            />

            {/* Monitor light glow - warm beige cream from center */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-1/3 w-[55%] h-[45%]"
              style={{
                background: 'radial-gradient(ellipse 100% 100% at 50% 40%, hsl(38 70% 65% / 0.28) 0%, hsl(36 65% 60% / 0.14) 40%, transparent 75%)',
                filter: 'blur(35px)',
              }}
              animate={{
                opacity: Math.pow(monitorLightIntensity / 100, 0.9),
              }}
              transition={{
                duration: 1.5,
                ease: [0.22, 0.03, 0.26, 1]
              }}
            />
          </div>

          {/* Dynamic shadow layer underneath image - responds to light intensity */}
          <motion.div 
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-[12%] pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isLoaded ? (allLightsOn ? 0.6 : 1) : 0,
            }}
            transition={{ 
              duration: 1.2,
              delay: 1.0,
              ease: [0.22, 0.03, 0.26, 1]
            }}
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 80%)',
              filter: 'blur(25px)',
            }}
          />
          
          {/* Warm glow reflection beneath image when lights are on */}
          <motion.div 
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[75%] h-[10%] pointer-events-none z-0"
            animate={{ 
              opacity: (spotlightIntensity + deskLampIntensity + monitorLightIntensity) / 300 * 0.4,
            }}
            transition={{ 
              duration: 1.2,
              ease: [0.22, 0.03, 0.26, 1]
            }}
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, hsl(38 70% 60% / 0.3) 0%, hsl(40 65% 55% / 0.15) 40%, transparent 70%)',
              filter: 'blur(30px)',
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
          initial={{ opacity: 0, x: 30 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            x: isLoaded ? 0 : 30
          }}
          transition={{ 
            duration: 1.0,
            delay: 0.6,
            ease: [0.22, 0.03, 0.26, 1]
          }}
        >
          <RoomInfoPanel
            roomName="Office Desk"
            temperature={21}
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
