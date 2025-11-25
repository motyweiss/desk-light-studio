import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DeskDisplay } from "@/components/DeskDisplay";
import { LightSwitch } from "@/components/LightSwitch";
import { Lightbulb } from "lucide-react";

const Index = () => {
  const [spotlight, setSpotlight] = useState(false);
  const [deskLamp, setDeskLamp] = useState(false);
  const [monitorLight, setMonitorLight] = useState(false);

  // Calculate master state based on individual lights
  const allLightsOn = spotlight && deskLamp && monitorLight;
  const anyLightOn = spotlight || deskLamp || monitorLight;
  const allLightsOff = !spotlight && !deskLamp && !monitorLight;
  
  // Master switch: ON when any light is on, OFF when all are off
  const masterChecked = anyLightOn;

  const handleMasterToggle = (checked: boolean) => {
    // When toggling Master ON - turn all lights ON
    // When toggling Master OFF - turn all lights OFF
    setSpotlight(checked);
    setDeskLamp(checked);
    setMonitorLight(checked);
  };

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
      {/* Header */}
      <div className="mb-8 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Lightbulb className="w-8 h-8 text-warm-glow" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Desk Lighting Studio
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Control the ambiance with interactive lighting
        </p>
      </div>

      {/* Main Display */}
      <div className="w-full max-w-2xl md:max-w-3xl mb-12 px-4 relative z-10">
        <DeskDisplay 
          spotlight={spotlight}
          deskLamp={deskLamp}
          monitorLight={monitorLight}
          onSpotlightToggle={() => setSpotlight(!spotlight)}
          onDeskLampToggle={() => setDeskLamp(!deskLamp)}
          onMonitorLightToggle={() => setMonitorLight(!monitorLight)}
        />
      </div>

      {/* Control Panel */}
      <div className="w-full max-w-4xl bg-card rounded-3xl p-8 shadow-xl border border-border relative z-10">
        <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
          Lighting Controls
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 justify-items-center">
          <LightSwitch
            label="Master"
            checked={masterChecked}
            onChange={handleMasterToggle}
            isMaster={true}
          />
          <LightSwitch
            label="Spotlight"
            checked={spotlight}
            onChange={setSpotlight}
          />
          <LightSwitch
            label="Desk Lamp"
            checked={deskLamp}
            onChange={setDeskLamp}
          />
          <LightSwitch
            label="Monitor Light"
            checked={monitorLight}
            onChange={setMonitorLight}
          />
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-8 text-center text-sm text-muted-foreground relative z-10">
        <p>Hover over the display and click on the light indicators</p>
      </div>
    </div>
  );
};

export default Index;
