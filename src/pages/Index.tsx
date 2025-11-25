import { useState } from "react";
import { motion } from "framer-motion";
import { DeskDisplay } from "@/components/DeskDisplay";

const Index = () => {
  const [spotlight, setSpotlight] = useState(false);
  const [deskLamp, setDeskLamp] = useState(false);
  const [monitorLight, setMonitorLight] = useState(false);

  // Calculate page background color based on current lighting state
  const getPageBackgroundColor = () => {
    const spotlightBit = spotlight ? "1" : "0";
    const deskLampBit = deskLamp ? "1" : "0";
    const monitorLightBit = monitorLight ? "1" : "0";
    const state = `${spotlightBit}${deskLampBit}${monitorLightBit}`;
    
    // Base dark color
    const baseDark = "220 20% 8%";
    
    // Specific colors for each lighting state - subtle shifts
    const stateColors: Record<string, string> = {
      "000": baseDark, // All off - pure dark blue
      "001": "210 22% 9%", // Monitor only - cool blue tint
      "010": "38 20% 10%", // Lamp only - warm yellow tint
      "011": "35 21% 9.5%", // Lamp + Monitor - balanced warm-cool
      "100": "30 22% 10%", // Spotlight only - warm orange tint
      "101": "25 21% 9.5%", // Spotlight + Monitor - orange-blue mix
      "110": "35 24% 11%", // Spotlight + Lamp - brighter warm
      "111": "32 26% 12%", // All on - brightest warm glow
    };
    
    return stateColors[state] || baseDark;
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden"
      animate={{
        backgroundColor: `hsl(${getPageBackgroundColor()})`,
      }}
      transition={{
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {/* Ambient page glow layers - spill beyond container */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 60% 60% at 65% 35%, hsla(var(--spotlight-glow) / 0.08) 0%, transparent 50%)`,
        }}
        animate={{
          opacity: spotlight ? 1 : 0,
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 55% 55% at 35% 60%, hsla(var(--lamp-glow) / 0.06) 0%, transparent 50%)`,
        }}
        animate={{
          opacity: deskLamp ? 1 : 0,
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 65% 65% at 50% 45%, hsla(var(--monitor-glow) / 0.05) 0%, transparent 55%)`,
        }}
        animate={{
          opacity: monitorLight ? 1 : 0,
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />

      {/* Main Display */}
      <div className="w-full max-w-4xl mx-auto relative z-10">
        <DeskDisplay 
          spotlight={spotlight}
          deskLamp={deskLamp}
          monitorLight={monitorLight}
          onSpotlightToggle={() => setSpotlight(!spotlight)}
          onDeskLampToggle={() => setDeskLamp(!deskLamp)}
          onMonitorLightToggle={() => setMonitorLight(!monitorLight)}
        />
      </div>
    </motion.div>
  );
};

export default Index;
