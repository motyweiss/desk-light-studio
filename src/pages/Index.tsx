import { useState } from "react";
import { motion } from "framer-motion";
import { DeskDisplay } from "@/components/DeskDisplay";

const Index = () => {
  const [spotlightIntensity, setSpotlightIntensity] = useState(0); // 0-100
  const [deskLampIntensity, setDeskLampIntensity] = useState(0);
  const [monitorLightIntensity, setMonitorLightIntensity] = useState(0);

  // Calculate page background color based on light intensities
  const getPageBackgroundColor = () => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    const state = `${spotlightBit}${deskLampBit}${monitorLightBit}`;
    
    // Harmonious colors matching each lighting state
    const stateColors: Record<string, string> = {
      "000": "240 8% 8%", // All off - deep cool dark navy
      "001": "220 25% 12%", // Monitor only - cool cyan-blue glow
      "010": "45 35% 15%", // Desk lamp only - warm golden amber
      "011": "180 20% 14%", // Lamp + Monitor - cyan-gold balance, teal undertone
      "100": "30 40% 16%", // Spotlight only - rich warm orange
      "101": "210 30% 14%", // Spotlight + Monitor - orange meets blue, balanced
      "110": "40 45% 18%", // Spotlight + Lamp - intense warm amber-orange
      "111": "35 50% 20%", // All on - brightest warm golden glow
    };
    
    return stateColors[state] || "240 8% 8%";
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
      {/* Enhanced ambient page glow layers - synchronized positions with soft spill */}
      
      {/* Spotlight ambient glow - warm orange radiance */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 75% 75% at 50% 35%, hsl(25 85% 55% / 0.18) 0%, hsl(30 80% 50% / 0.08) 30%, transparent 60%)`,
          filter: 'blur(60px)',
        }}
        animate={{
          opacity: Math.pow(spotlightIntensity / 100, 0.8),
        }}
        transition={{
          duration: 1.4,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Desk lamp ambient glow - warm golden yellow */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 30% 55%, hsl(45 90% 60% / 0.16) 0%, hsl(42 85% 55% / 0.06) 35%, transparent 58%)`,
          filter: 'blur(55px)',
        }}
        animate={{
          opacity: Math.pow(deskLampIntensity / 100, 0.8),
        }}
        transition={{
          duration: 1.4,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Monitor light ambient glow - cool cyan-blue */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 40%, hsl(200 80% 65% / 0.14) 0%, hsl(210 75% 60% / 0.05) 38%, transparent 62%)`,
          filter: 'blur(50px)',
        }}
        animate={{
          opacity: Math.pow(monitorLightIntensity / 100, 0.8),
        }}
        transition={{
          duration: 1.4,
          ease: [0.4, 0, 0.2, 1]
        }}
      />

      {/* Main Display */}
      <div className="w-[40%] mx-auto relative z-10">
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
    </motion.div>
  );
};

export default Index;
