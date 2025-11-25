import { useState, useEffect } from "react";
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
  
  // Master switch reflects if all lights are on
  const masterChecked = allLightsOn;

  const handleMasterToggle = (checked: boolean) => {
    // When master is toggled, set all lights to the same state
    setSpotlight(checked);
    setDeskLamp(checked);
    setMonitorLight(checked);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12">
      {/* Header */}
      <div className="mb-8 text-center">
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
      <div className="w-full max-w-2xl md:max-w-3xl mb-12 px-4">
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
      <div className="w-full max-w-4xl bg-card rounded-3xl p-8 shadow-xl border border-border">
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
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Hover over the display and click on the light indicators</p>
      </div>
    </div>
  );
};

export default Index;
