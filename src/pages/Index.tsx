import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Sun, Thermometer, Droplets, Wind } from "lucide-react";
import { DeskDisplay } from "@/components/DeskDisplay";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { AmbientGlowLayers } from "@/components/AmbientGlowLayers";
import { SettingsButton } from "@/components/SettingsButton";
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useHomeAssistantConfig } from "@/hooks/useHomeAssistantConfig";
import { homeAssistant } from "@/services/homeAssistant";

// Import all desk images for preloading
import desk000 from "@/assets/desk-000.png";
import desk001 from "@/assets/desk-001.png";
import desk010 from "@/assets/desk-010.png";
import desk011 from "@/assets/desk-011.png";
import desk100 from "@/assets/desk-100.png";
import desk101 from "@/assets/desk-101.png";
import desk110 from "@/assets/desk-110.png";
import desk111 from "@/assets/desk-111.png";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [spotlightIntensity, setSpotlightIntensity] = useState(0); // 0-100
  const [deskLampIntensity, setDeskLampIntensity] = useState(0);
  const [monitorLightIntensity, setMonitorLightIntensity] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Climate sensor states
  const [temperature, setTemperature] = useState(21.0);
  const [humidity, setHumidity] = useState(49);
  const [airQuality, setAirQuality] = useState(85);

  // Hover states for coordinated UI
  const [hoveredLight, setHoveredLight] = useState<string | null>(null);
  
  // Ref to prevent polling updates during manual changes
  const isManualChangeRef = useRef(false);
  
  // Home Assistant integration
  const { toast } = useToast();
  const { config, entityMapping, isConnected, saveConfig } = useHomeAssistantConfig();

  // Optimized image loading - preload primary "all lights off" image first
  useEffect(() => {
    // Preload the initial "all lights off" image first for fast perceived loading
    const primaryImage = new Image();
    primaryImage.src = desk000;
    
    const handlePrimaryLoad = () => {
      setIsLoading(false);
      // Small delay before starting entrance animations
      setTimeout(() => {
        setIsLoaded(true);
      }, 100);
      
      // Preload remaining images in background after primary loads
      const remainingImages = [desk001, desk010, desk011, desk100, desk101, desk110, desk111];
      remainingImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    
    primaryImage.onload = handlePrimaryLoad;
    
    // Fallback timeout in case image takes too long (8 seconds max)
    const fallbackTimer = setTimeout(() => {
      handlePrimaryLoad();
    }, 8000);
    
    return () => clearTimeout(fallbackTimer);
  }, []);

  // Master switch logic - bidirectional synchronization
  const allLightsOn = spotlightIntensity > 0 || deskLampIntensity > 0 || monitorLightIntensity > 0;
  const masterSwitchOn = allLightsOn;

  const handleMasterToggle = useCallback(async (checked: boolean) => {
    isManualChangeRef.current = true;
    const targetIntensity = checked ? 100 : 0;
    setSpotlightIntensity(targetIntensity);
    setDeskLampIntensity(targetIntensity);
    setMonitorLightIntensity(targetIntensity);

    // Sync with Home Assistant if connected
    if (isConnected && entityMapping) {
      if (entityMapping.spotlight) await homeAssistant.setLightBrightness(entityMapping.spotlight, targetIntensity);
      if (entityMapping.deskLamp) await homeAssistant.setLightBrightness(entityMapping.deskLamp, targetIntensity);
      if (entityMapping.monitorLight) await homeAssistant.setLightBrightness(entityMapping.monitorLight, targetIntensity);
    }
    
    setTimeout(() => {
      isManualChangeRef.current = false;
    }, 1000);
  }, [isConnected, entityMapping]);

  // Handle individual light intensity changes with Home Assistant sync
  const createLightChangeHandler = useCallback((lightId: string, setter: (value: number) => void) => {
    return async (newIntensity: number) => {
      isManualChangeRef.current = true;
      setter(newIntensity);

      // Sync with Home Assistant if connected
      if (isConnected && entityMapping) {
        const entityId = lightId === "spotlight" 
          ? entityMapping.spotlight 
          : lightId === "deskLamp" 
          ? entityMapping.deskLamp 
          : entityMapping.monitorLight;

        if (entityId) {
          await homeAssistant.setLightBrightness(entityId, newIntensity);
        }
      }
      
      setTimeout(() => {
        isManualChangeRef.current = false;
      }, 1000);
    };
  }, [isConnected, entityMapping]);

  const handleSaveSettings = (
    newConfig: { baseUrl: string; accessToken: string },
    newMapping: { deskLamp?: string; monitorLight?: string; spotlight?: string }
  ) => {
    saveConfig(newConfig, newMapping);
    toast({
      title: "✓ Connected to Home Assistant",
      description: "Your lights are now synced",
    });
  };

  // Bidirectional sync with Home Assistant - poll for state changes
  useEffect(() => {
    if (!isConnected || !entityMapping) return;

    const lightEntityIds = [
      entityMapping.spotlight,
      entityMapping.deskLamp,
      entityMapping.monitorLight,
    ].filter(Boolean) as string[];
    
    const sensorEntityIds = [
      entityMapping.temperatureSensor,
      entityMapping.humiditySensor,
      entityMapping.airQualitySensor,
    ].filter(Boolean) as string[];

    const allEntityIds = [...lightEntityIds, ...sensorEntityIds];

    if (allEntityIds.length === 0) return;

    console.log("🔄 Starting Home Assistant sync polling");
    console.log("📡 Light entities:", lightEntityIds);
    console.log("🌡️ Sensor entities:", sensorEntityIds);

    const syncStates = async () => {
      // Skip if user is manually changing lights
      if (isManualChangeRef.current) {
        console.log("⏭️  Skipping sync - manual change in progress");
        return;
      }

      try {
        const states = await homeAssistant.getAllEntityStates(allEntityIds);
        
        // Update light entities
        // Update spotlight
        if (entityMapping.spotlight && states.has(entityMapping.spotlight)) {
          const state = states.get(entityMapping.spotlight)!;
          const newIntensity = state.state === "on" 
            ? Math.round((state.brightness || 255) / 255 * 100)
            : 0;
          
          setSpotlightIntensity(current => {
            if (Math.abs(current - newIntensity) > 2) {
              console.log(`💡 Spotlight synced: ${current} → ${newIntensity}%`);
              return newIntensity;
            }
            return current;
          });
        }

        // Update desk lamp
        if (entityMapping.deskLamp && states.has(entityMapping.deskLamp)) {
          const state = states.get(entityMapping.deskLamp)!;
          const newIntensity = state.state === "on" 
            ? Math.round((state.brightness || 255) / 255 * 100)
            : 0;
          
          setDeskLampIntensity(current => {
            if (Math.abs(current - newIntensity) > 2) {
              console.log(`💡 Desk Lamp synced: ${current} → ${newIntensity}%`);
              return newIntensity;
            }
            return current;
          });
        }

        // Update monitor light
        if (entityMapping.monitorLight && states.has(entityMapping.monitorLight)) {
          const state = states.get(entityMapping.monitorLight)!;
          const newIntensity = state.state === "on" 
            ? Math.round((state.brightness || 255) / 255 * 100)
            : 0;
          
          setMonitorLightIntensity(current => {
            if (Math.abs(current - newIntensity) > 2) {
              console.log(`💡 Monitor Light synced: ${current} → ${newIntensity}%`);
              return newIntensity;
            }
            return current;
          });
        }
        
        // Update sensor entities
        // Update temperature
        if (entityMapping.temperatureSensor && states.has(entityMapping.temperatureSensor)) {
          const state = states.get(entityMapping.temperatureSensor)!;
          const tempValue = parseFloat(state.state);
          
          if (!isNaN(tempValue)) {
            setTemperature(current => {
              if (Math.abs(current - tempValue) > 0.1) {
                console.log(`🌡️ Temperature synced: ${current} → ${tempValue}°C`);
                return tempValue;
              }
              return current;
            });
          }
        }
        
        // Update humidity
        if (entityMapping.humiditySensor && states.has(entityMapping.humiditySensor)) {
          const state = states.get(entityMapping.humiditySensor)!;
          const humidityValue = parseFloat(state.state);
          
          if (!isNaN(humidityValue)) {
            setHumidity(current => {
              if (Math.abs(current - humidityValue) > 1) {
                console.log(`💧 Humidity synced: ${current} → ${humidityValue}%`);
                return Math.round(humidityValue);
              }
              return current;
            });
          }
        }
        
        // Update air quality (PM2.5)
        if (entityMapping.airQualitySensor && states.has(entityMapping.airQualitySensor)) {
          const state = states.get(entityMapping.airQualitySensor)!;
          const aqValue = parseFloat(state.state);
          
          if (!isNaN(aqValue)) {
            setAirQuality(current => {
              if (Math.abs(current - aqValue) > 1) {
                console.log(`🌬️ Air Quality synced: ${current} → ${aqValue}`);
                return Math.round(aqValue);
              }
              return current;
            });
          }
        }
      } catch (error) {
        console.error("❌ Failed to sync with Home Assistant:", error);
      }
    };

    // Initial sync
    syncStates();

    // Poll every 3 seconds
    const interval = setInterval(syncStates, 3000);

    return () => {
      console.log("🛑 Stopping Home Assistant sync polling");
      clearInterval(interval);
    };
  }, [isConnected, entityMapping]);

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

  // Calculate binary lighting state (on/off only, not intensity)
  const lightingState = useMemo(() => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  }, [spotlightIntensity, deskLampIntensity, monitorLightIntensity]);

  // Track binary state changes only (not continuous slider adjustments)
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [lightingState]);

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <ConnectionStatusIndicator isConnected={isConnected} />
      <SettingsButton onClick={() => setSettingsOpen(true)} />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={handleSaveSettings}
        currentConfig={config}
        currentMapping={entityMapping}
      />
      <Toaster />

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
                  ? 'border-[hsl(43_90%_60%/0.7)]' 
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
                  color: masterSwitchOn ? 'hsl(44 92% 62%)' : 'rgba(255, 255, 255, 0.4)'
                }}
                transition={{ duration: 0.5, ease: [0.22, 0.03, 0.26, 1] }}
                className="flex items-center justify-center"
              >
                <Sun className="w-5 h-5" strokeWidth={2} />
              </motion.div>
            </motion.button>
          </div>

          {/* Climate Data - Minimal inline version */}
          <motion.div 
            className="flex gap-8 mb-3"
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
            {/* Temperature - Icon + Number only */}
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-white/60" strokeWidth={1.5} />
              <div className="text-base font-light text-white tabular-nums">{temperature.toFixed(1)}°</div>
            </div>

            {/* Humidity - Icon + Number only */}
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-white/60" strokeWidth={1.5} />
              <div className="text-base font-light text-white tabular-nums">{humidity}%</div>
            </div>

            {/* PM 2.5 - Icon + Number only */}
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-white/60" strokeWidth={1.5} />
              <div className="text-base font-light text-white tabular-nums">
                {airQuality}
                <span className="text-[10px] text-white/40 ml-1">µg/m³</span>
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
                background: 'radial-gradient(ellipse 100% 100% at 50% 0%, hsl(42 75% 58% / 0.28) 0%, hsl(43 70% 55% / 0.14) 35%, transparent 70%)',
                filter: 'blur(40px)',
              }}
              animate={{
                opacity: Math.pow(spotlightIntensity / 100, 2.0),
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
                background: 'radial-gradient(ellipse 100% 100% at 0% 50%, hsl(44 80% 62% / 0.32) 0%, hsl(45 75% 58% / 0.16) 38%, transparent 72%)',
                filter: 'blur(45px)',
              }}
              animate={{
                opacity: Math.pow(deskLampIntensity / 100, 2.0),
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
                background: 'radial-gradient(ellipse 100% 100% at 50% 40%, hsl(43 70% 60% / 0.26) 0%, hsl(44 65% 56% / 0.13) 40%, transparent 75%)',
                filter: 'blur(35px)',
              }}
              animate={{
                opacity: Math.pow(monitorLightIntensity / 100, 2.0),
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
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, hsl(43 70% 58% / 0.28) 0%, hsl(44 65% 54% / 0.14) 40%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          <DeskDisplay
            spotlightIntensity={spotlightIntensity}
            deskLampIntensity={deskLampIntensity}
            monitorLightIntensity={monitorLightIntensity}
            onSpotlightChange={createLightChangeHandler('spotlight', setSpotlightIntensity)}
            onDeskLampChange={createLightChangeHandler('deskLamp', setDeskLampIntensity)}
            onMonitorLightChange={createLightChangeHandler('monitorLight', setMonitorLightIntensity)}
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
            temperature={temperature}
            humidity={humidity}
            airQuality={airQuality}
            masterSwitchOn={masterSwitchOn}
            onMasterToggle={handleMasterToggle}
            onLightHover={setHoveredLight}
            lights={[
              { 
                id: 'deskLamp', 
                label: 'Desk Lamp', 
                intensity: deskLampIntensity, 
                onChange: createLightChangeHandler('deskLamp', setDeskLampIntensity)
              },
              { 
                id: 'monitorLight', 
                label: 'Monitor Back Light', 
                intensity: monitorLightIntensity, 
                onChange: createLightChangeHandler('monitorLight', setMonitorLightIntensity)
              },
              { 
                id: 'spotlight', 
                label: 'Spotlight', 
                intensity: spotlightIntensity, 
                onChange: createLightChangeHandler('spotlight', setSpotlightIntensity)
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
