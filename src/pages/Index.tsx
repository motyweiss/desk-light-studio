import { useState } from "react";
import { motion } from "framer-motion";
import { DeskDisplay } from "@/components/DeskDisplay";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";

const Index = () => {
  const [spotlightIntensity, setSpotlightIntensity] = useState(0); // 0-100
  const [deskLampIntensity, setDeskLampIntensity] = useState(0);
  const [monitorLightIntensity, setMonitorLightIntensity] = useState(0);

  // Master switch logic - bidirectional synchronization
  const allLightsOn = spotlightIntensity > 0 || deskLampIntensity > 0 || monitorLightIntensity > 0;
  const masterSwitchOn = allLightsOn;

  const handleMasterToggle = (checked: boolean) => {
    const targetIntensity = checked ? 100 : 0;
    setSpotlightIntensity(targetIntensity);
    setDeskLampIntensity(targetIntensity);
    setMonitorLightIntensity(targetIntensity);
  };

  // Calculate page background color based on light intensities
  const getPageBackgroundColor = () => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    const state = `${spotlightBit}${deskLampBit}${monitorLightBit}`;
    
    // Harmonized colors derived from desk images - each state creates unique atmosphere
    const stateColors: Record<string, string> = {
      "000": "215 22% 12%", // All off - deep rich blue-gray, matches dark ambient scene
      "001": "208 20% 14%", // Monitor only - cool blue tone, screen glow harmony
      "010": "28 18% 15%", // Desk lamp only - warm amber undertone from lamp glow
      "011": "25 16% 16%", // Lamp + Monitor - balanced warm-cool, mixed lighting
      "100": "32 15% 16%", // Spotlight only - warm ceiling light ambiance
      "101": "22 14% 17%", // Spotlight + Monitor - warm with cool accent
      "110": "30 14% 18%", // Spotlight + Lamp - double warm sources, golden hour feel
      "111": "26 12% 19%", // All on - brightest, neutral warm-cool balance, fully lit workspace
    };
    
    return stateColors[state] || "215 22% 12%";
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden"
      animate={{
        backgroundColor: `hsl(${getPageBackgroundColor()})`,
      }}
      transition={{
        duration: 2.0,
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
          duration: 1.6,
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
          duration: 1.6,
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
          duration: 1.6,
          ease: [0.4, 0, 0.2, 1]
        }}
      />

      {/* Two-Column Layout Container */}
      <div className="flex items-center gap-12 max-w-7xl w-full relative z-10">
        {/* Left Panel - Room Info */}
        <div className="w-[40%]">
          <RoomInfoPanel
            roomName="Office Desk"
            temperature={24.4}
            humidity={49}
            masterSwitchOn={masterSwitchOn}
            onMasterToggle={handleMasterToggle}
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
          />
        </div>

        {/* Right Panel - Desk Display */}
        <div className="w-[55%] relative">
          {/* Soft shadow layer underneath image */}
          <div 
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-[12%] pointer-events-none z-0"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.08) 50%, transparent 80%)',
              filter: 'blur(20px)',
            }}
          />
          <DeskDisplay
            spotlightIntensity={spotlightIntensity}
            deskLampIntensity={deskLampIntensity}
            monitorLightIntensity={monitorLightIntensity}
            onSpotlightChange={setSpotlightIntensity}
            onDeskLampChange={setDeskLampIntensity}
            onMonitorLightChange={setMonitorLightIntensity}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Index;
