import { useState } from "react";
import { motion } from "framer-motion";
import { DeskDisplay } from "@/components/DeskDisplay";

const Index = () => {
  const [spotlight, setSpotlight] = useState(false);
  const [deskLamp, setDeskLamp] = useState(false);
  const [monitorLight, setMonitorLight] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
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
    </div>
  );
};

export default Index;
