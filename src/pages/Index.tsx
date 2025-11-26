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
      {/* Enhanced ambient page glow layers - synchronized positions with soft spill */}
      
      {/* Spotlight ambient glow - extends from container position */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 62% 30%, hsla(var(--spotlight-glow) / 0.12) 0%, hsla(var(--spotlight-glow) / 0.04) 35%, transparent 55%)`,
          filter: 'blur(40px)',
        }}
        animate={{
          opacity: Math.pow(spotlightIntensity / 100, 0.7),
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Desk lamp ambient glow */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 65% 65% at 35% 58%, hsla(var(--lamp-glow) / 0.1) 0%, hsla(var(--lamp-glow) / 0.03) 35%, transparent 55%)`,
          filter: 'blur(40px)',
        }}
        animate={{
          opacity: Math.pow(deskLampIntensity / 100, 0.7),
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Monitor light ambient glow */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 75% 75% at 50% 42%, hsla(var(--monitor-glow) / 0.08) 0%, hsla(var(--monitor-glow) / 0.02) 40%, transparent 60%)`,
          filter: 'blur(40px)',
        }}
        animate={{
          opacity: Math.pow(monitorLightIntensity / 100, 0.7),
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
