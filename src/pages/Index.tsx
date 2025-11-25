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
    
    // Base dark color
    const baseDark = "25 15% 6%";
    
    // Specific colors for each lighting state - subtle shifts
    const stateColors: Record<string, string> = {
      "000": baseDark, // All off - warm dark
      "001": "220 15% 7%", // Monitor only - cool blue tint (subtle)
      "010": "35 20% 8%", // Lamp only - warm yellow tint
      "011": "30 18% 8%", // Lamp + Monitor - balanced warm-cool
      "100": "30 25% 8%", // Spotlight only - warm orange tint
      "101": "28 20% 8%", // Spotlight + Monitor - orange-blue mix
      "110": "32 28% 9%", // Spotlight + Lamp - brighter warm
      "111": "30 30% 10%", // All on - brightest warm glow
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
          opacity: spotlightIntensity / 100,
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
          opacity: deskLampIntensity / 100,
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
          opacity: monitorLightIntensity / 100,
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />

      {/* Main Display */}
      <div className="w-full max-w-4xl mx-auto relative z-10">
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
