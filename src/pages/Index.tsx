import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Sun, Thermometer, Droplets, Wind } from "lucide-react";
import { DeskDisplay } from "@/components/DeskDisplay";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { AmbientGlowLayers } from "@/components/AmbientGlowLayers";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator";
import { SettingsDialog } from "@/components/SettingsDialog";
import { MediaPlayer } from "@/components/MediaPlayer/MediaPlayer";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useHomeAssistantConfig } from "@/hooks/useHomeAssistantConfig";
import { homeAssistant } from "@/services/homeAssistant";
import { useHomeAssistantSync } from "@/hooks/useHomeAssistantSync";
import { EASING, DURATION, BLOCKING_WINDOW } from "@/constants/animations";

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
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  const [spotlightIntensity, setSpotlightIntensity] = useState(0);
  const [deskLampIntensity, setDeskLampIntensity] = useState(0);
  const [monitorLightIntensity, setMonitorLightIntensity] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Track if initial HA state has been loaded
  const [hasLoadedInitialState, setHasLoadedInitialState] = useState(false);
  
  // Climate sensor states
  const [temperature, setTemperature] = useState(21.0);
  const [humidity, setHumidity] = useState(49);
  const [airQuality, setAirQuality] = useState(85);
  
  // Device battery states
  const [iphoneBatteryLevel, setIphoneBatteryLevel] = useState(0);
  const [iphoneBatteryCharging, setIphoneBatteryCharging] = useState(false);

  // Hover states for coordinated UI
  const [hoveredLight, setHoveredLight] = useState<string | null>(null);
  
  // Track lights with pending HA commands to prevent polling overwrites
  const [pendingLights, setPendingLights] = useState<Set<string>>(new Set());
  
  // Connection retry state  
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // Home Assistant integration
  const { toast } = useToast();
  const { config, entityMapping, isConnected, saveConfig } = useHomeAssistantConfig();

  // Use new sync hook
  const { forceSyncStates, markManualChange, attemptReconnect, pendingLights: syncPendingLights } = useHomeAssistantSync({
    isConnected,
    entityMapping,
    pendingLights,
    onLightsUpdate: (lights) => {
      if (lights.spotlight !== undefined) setSpotlightIntensity(lights.spotlight);
      if (lights.deskLamp !== undefined) setDeskLampIntensity(lights.deskLamp);
      if (lights.monitorLight !== undefined) setMonitorLightIntensity(lights.monitorLight);
    },
    onSensorsUpdate: (sensors) => {
      if (sensors.temperature !== undefined) setTemperature(sensors.temperature);
      if (sensors.humidity !== undefined) setHumidity(sensors.humidity);
      if (sensors.airQuality !== undefined) setAirQuality(sensors.airQuality);
      if (sensors.iphoneBatteryLevel !== undefined) setIphoneBatteryLevel(sensors.iphoneBatteryLevel);
      if (sensors.iphoneBatteryCharging !== undefined) setIphoneBatteryCharging(sensors.iphoneBatteryCharging);
    },
    onReconnectingChange: setIsReconnecting,
  });

  // Reset initial state loading flag when connection changes
  useEffect(() => {
    if (!isConnected) {
      setHasLoadedInitialState(false);
    }
  }, [isConnected]);

  // Optimized image loading - preload primary "all lights off" image first
  useEffect(() => {
    const startTime = Date.now();
    const minLoadTime = 500; // Minimum 500ms loading time
    
    // Preload both the desk image and background
    const primaryImage = new Image();
    const backgroundImage = new Image();
    primaryImage.src = desk000;
    backgroundImage.src = '/bg.png';
    
    let primaryLoaded = false;
    let bgLoaded = false;
    
    const checkAllLoaded = () => {
      if (!primaryLoaded || !bgLoaded) return;
      
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      // Wait for minimum load time before hiding spinner
      setTimeout(() => {
        setIsLoading(false);
        
        // Coordinate state updates in single frame to prevent flashing
        requestAnimationFrame(() => {
          setBackgroundLoaded(true);
          setIsLoaded(true);
        });
        
        // Show media player after page content settles (2 seconds after content loads)
        const mediaTimer = setTimeout(() => {
          setShowMediaPlayer(true);
        }, 2000);
        
        // Preload remaining images in background after primary loads
        const remainingImages = [desk001, desk010, desk011, desk100, desk101, desk110, desk111];
        remainingImages.forEach(src => {
          const img = new Image();
          img.src = src;
        });
        
        return () => clearTimeout(mediaTimer);
      }, remainingTime);
    };
    
    primaryImage.onload = () => {
      primaryLoaded = true;
      checkAllLoaded();
    };
    
    backgroundImage.onload = () => {
      bgLoaded = true;
      checkAllLoaded();
    };
    
    // Fallback timeout in case images take too long (8 seconds max + min load time)
    const fallbackTimer = setTimeout(() => {
      primaryLoaded = true;
      bgLoaded = true;
      checkAllLoaded();
    }, 8000 + minLoadTime);
    
    return () => clearTimeout(fallbackTimer);
  }, []);

  // Master switch logic - bidirectional synchronization
  const allLightsOn = spotlightIntensity > 0 || deskLampIntensity > 0 || monitorLightIntensity > 0;
  const masterSwitchOn = allLightsOn;

  const handleMasterToggle = useCallback(async (checked: boolean) => {
    const targetIntensity = checked ? 100 : 0;
    markManualChange();
    
    console.log(`🎛️  MASTER TOGGLE: ${checked ? 'ON' : 'OFF'} (target: ${targetIntensity}%)`);
    
    // Mark all lights as pending
    setPendingLights(new Set(['spotlight', 'deskLamp', 'monitorLight']));
    
    setSpotlightIntensity(targetIntensity);
    setDeskLampIntensity(targetIntensity);
    setMonitorLightIntensity(targetIntensity);

    // Sync with Home Assistant if connected
    if (isConnected && entityMapping) {
      console.log('📤 Sending master toggle to Home Assistant...');
      const promises = [];
      
      if (entityMapping.spotlight) {
        promises.push(
          homeAssistant.setLightBrightness(entityMapping.spotlight, targetIntensity)
            .then(() => console.log(`  ✅ Spotlight → ${targetIntensity}%`))
            .catch(err => console.error(`  ❌ Spotlight failed:`, err))
        );
      }
      if (entityMapping.deskLamp) {
        promises.push(
          homeAssistant.setLightBrightness(entityMapping.deskLamp, targetIntensity)
            .then(() => console.log(`  ✅ Desk Lamp → ${targetIntensity}%`))
            .catch(err => console.error(`  ❌ Desk Lamp failed:`, err))
        );
      }
      if (entityMapping.monitorLight) {
        promises.push(
          homeAssistant.setLightBrightness(entityMapping.monitorLight, targetIntensity)
            .then(() => console.log(`  ✅ Monitor Light → ${targetIntensity}%`))
            .catch(err => console.error(`  ❌ Monitor Light failed:`, err))
        );
      }
      
      await Promise.all(promises);
      
      // Wait for HA to confirm, then clear pending
      setTimeout(() => {
        setPendingLights(new Set());
      }, BLOCKING_WINDOW.pendingConfirm);
    } else {
      console.log('⚠️  Master toggle: Not connected to HA, local only');
      setPendingLights(new Set());
    }
  }, [isConnected, entityMapping, markManualChange]);

  // Handle individual light intensity changes with Home Assistant sync
  const createLightChangeHandler = useCallback((lightId: string, setter: (value: number) => void) => {
    return async (newIntensity: number) => {
      markManualChange();
      
      console.log(`💡 MANUAL CHANGE: ${lightId} → ${newIntensity}%`);
      
      // Mark light as pending immediately
      setPendingLights(prev => new Set(prev).add(lightId));
      
      setter(newIntensity);

      // Sync with Home Assistant if connected
      if (isConnected && entityMapping) {
        const entityId = lightId === "spotlight" 
          ? entityMapping.spotlight 
          : lightId === "deskLamp" 
          ? entityMapping.deskLamp 
          : entityMapping.monitorLight;

        if (entityId) {
          console.log(`📤 Sending to HA: ${entityId} → ${newIntensity}%`);
          try {
            await homeAssistant.setLightBrightness(entityId, newIntensity);
            console.log(`  ✅ Success`);
            
            // Wait for HA to confirm, then clear pending
            setTimeout(() => {
              setPendingLights(prev => {
                const next = new Set(prev);
                next.delete(lightId);
                return next;
              });
            }, BLOCKING_WINDOW.pendingConfirm);
          } catch (error) {
            console.error(`  ❌ Failed to sync ${lightId}:`, error);
            // Clear pending on error too
            setPendingLights(prev => {
              const next = new Set(prev);
              next.delete(lightId);
              return next;
            });
          }
        }
      } else {
        console.log(`  ⚠️  Not connected to HA, local only`);
        setPendingLights(prev => {
          const next = new Set(prev);
          next.delete(lightId);
          return next;
        });
      }
    };
  }, [isConnected, entityMapping, markManualChange]);

  const handleSaveSettings = (
    newConfig: { baseUrl: string; accessToken: string },
    newMapping: { 
      deskLamp?: string; 
      monitorLight?: string; 
      spotlight?: string;
      temperatureSensor?: string;
      humiditySensor?: string;
      airQualitySensor?: string;
    }
  ) => {
    saveConfig(newConfig, newMapping);
    toast({
      title: "✓ Connected to Home Assistant",
      description: "Your lights are now synced",
    });
  };

  // Initial sync on page load - fetch current state before animations
  useEffect(() => {
    if (!isConnected || !entityMapping) return;

    const initialSync = async () => {
      const lightEntityIds = [
        entityMapping.spotlight,
        entityMapping.deskLamp,
        entityMapping.monitorLight,
      ].filter(Boolean) as string[];
      
      const sensorEntityIds = [
        entityMapping.temperatureSensor,
        entityMapping.humiditySensor,
        entityMapping.airQualitySensor,
        entityMapping.iphoneBatteryLevel,
        entityMapping.iphoneBatteryState,
      ].filter(Boolean) as string[];

      const allEntityIds = [...lightEntityIds, ...sensorEntityIds];

      if (allEntityIds.length === 0) return;

      console.log("🔄 Initial sync from Home Assistant");

      try {
        const states = await homeAssistant.getAllEntityStates(allEntityIds);
        
        // Update lights
        if (entityMapping.spotlight && states.has(entityMapping.spotlight)) {
          const state = states.get(entityMapping.spotlight)!;
          const newIntensity = state.state === "on" 
            ? Math.round((state.brightness || 255) / 255 * 100)
            : 0;
          setSpotlightIntensity(newIntensity);
          console.log(`💡 Spotlight initial: ${newIntensity}%`);
        }

        if (entityMapping.deskLamp && states.has(entityMapping.deskLamp)) {
          const state = states.get(entityMapping.deskLamp)!;
          const newIntensity = state.state === "on" 
            ? Math.round((state.brightness || 255) / 255 * 100)
            : 0;
          setDeskLampIntensity(newIntensity);
          console.log(`💡 Desk Lamp initial: ${newIntensity}%`);
        }

        if (entityMapping.monitorLight && states.has(entityMapping.monitorLight)) {
          const state = states.get(entityMapping.monitorLight)!;
          const newIntensity = state.state === "on" 
            ? Math.round((state.brightness || 255) / 255 * 100)
            : 0;
          setMonitorLightIntensity(newIntensity);
          console.log(`💡 Monitor Light initial: ${newIntensity}%`);
        }
        
        // Update sensors
        if (entityMapping.temperatureSensor && states.has(entityMapping.temperatureSensor)) {
          const state = states.get(entityMapping.temperatureSensor)!;
          const tempValue = parseFloat(state.state);
          if (!isNaN(tempValue)) {
            setTemperature(tempValue);
            console.log(`🌡️ Temperature initial: ${tempValue}°C`);
          }
        }
        
        if (entityMapping.humiditySensor && states.has(entityMapping.humiditySensor)) {
          const state = states.get(entityMapping.humiditySensor)!;
          const humidityValue = parseFloat(state.state);
          if (!isNaN(humidityValue)) {
            setHumidity(Math.round(humidityValue));
            console.log(`💧 Humidity initial: ${humidityValue}%`);
          }
        }
        
        if (entityMapping.airQualitySensor && states.has(entityMapping.airQualitySensor)) {
          const state = states.get(entityMapping.airQualitySensor)!;
          const aqValue = parseFloat(state.state);
          if (!isNaN(aqValue)) {
            setAirQuality(Math.round(aqValue));
            console.log(`🌬️ Air Quality initial: ${aqValue}`);
          }
        }
        
        // Update battery sensors
        if (entityMapping.iphoneBatteryLevel && states.has(entityMapping.iphoneBatteryLevel)) {
          const state = states.get(entityMapping.iphoneBatteryLevel)!;
          const batteryValue = parseFloat(state.state);
          if (!isNaN(batteryValue)) {
            setIphoneBatteryLevel(Math.round(batteryValue));
            console.log(`🔋 iPhone Battery initial: ${batteryValue}%`);
          }
        }
        
        if (entityMapping.iphoneBatteryState && states.has(entityMapping.iphoneBatteryState)) {
          const state = states.get(entityMapping.iphoneBatteryState)!;
          const isCharging = state.state.toLowerCase().includes("charging") && !state.state.toLowerCase().includes("not");
          setIphoneBatteryCharging(isCharging);
          console.log(`⚡ iPhone Charging initial: ${state.state} → ${isCharging}`);
        }
        
        // Mark initial state as loaded
        setHasLoadedInitialState(true);
      } catch (error) {
        console.error("❌ Failed to perform initial sync:", error);
        toast({
          title: "Connection Failed",
          description: "Unable to connect to Home Assistant. Retrying...",
          variant: "destructive",
        });
      }
    };

    initialSync();
  }, [isConnected, entityMapping, toast]); // Run once when connected

  // Window focus/visibility sync - sync immediately when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isConnected) {
        console.log("👀 Tab visible - triggering sync");
        forceSyncStates();
      }
    };

    const handleFocus = () => {
      if (isConnected) {
        console.log("🔍 Window focused - triggering sync");
        forceSyncStates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isConnected, forceSyncStates]);

  // Keyboard shortcuts with proper HA sync
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Prevent if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '1':
          // Toggle Desk Lamp with HA sync
          e.preventDefault();
          console.log('⌨️  Keyboard: Toggle Desk Lamp (key "1")');
          const newDeskLampIntensity = deskLampIntensity > 0 ? 0 : 100;
          await createLightChangeHandler('deskLamp', setDeskLampIntensity)(newDeskLampIntensity);
          break;
        case '2':
          // Toggle Monitor Light with HA sync
          e.preventDefault();
          console.log('⌨️  Keyboard: Toggle Monitor Light (key "2")');
          const newMonitorIntensity = monitorLightIntensity > 0 ? 0 : 100;
          await createLightChangeHandler('monitorLight', setMonitorLightIntensity)(newMonitorIntensity);
          break;
        case '3':
          // Toggle Spotlight with HA sync
          e.preventDefault();
          console.log('⌨️  Keyboard: Toggle Spotlight (key "3")');
          const newSpotlightIntensity = spotlightIntensity > 0 ? 0 : 100;
          await createLightChangeHandler('spotlight', setSpotlightIntensity)(newSpotlightIntensity);
          break;
        case ' ':
          // Master toggle with spacebar
          e.preventDefault(); // Prevent page scroll
          console.log('⌨️  Keyboard: Master Toggle (spacebar)');
          handleMasterToggle(!masterSwitchOn);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [masterSwitchOn, deskLampIntensity, monitorLightIntensity, spotlightIntensity, isConnected, entityMapping, handleMasterToggle, createLightChangeHandler]);

  // Calculate binary lighting state (on/off only, not intensity)
  const lightingState = useMemo(() => {
    const spotlightBit = spotlightIntensity > 0 ? "1" : "0";
    const deskLampBit = deskLampIntensity > 0 ? "1" : "0";
    const monitorLightBit = monitorLightIntensity > 0 ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  }, [spotlightIntensity, deskLampIntensity, monitorLightIntensity]);

  // Track binary state changes only (not continuous slider adjustments)
  const isFirstRenderRef = useRef(true);
  
  useEffect(() => {
    // Skip isTransitioning on first render to prevent flickering on page load
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [lightingState]);

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <ConnectionStatusIndicator 
        isConnected={isConnected} 
        isReconnecting={isReconnecting}
        onReconnectClick={attemptReconnect}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={handleSaveSettings}
        currentConfig={config}
        currentMapping={entityMapping}
      />
      <Toaster />

      <div
        className="min-h-[100dvh] flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
        style={{
          backgroundImage: backgroundLoaded ? "url('/bg.png')" : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "hsl(0 0% 8%)",
        }}
      >
        {/* Dynamic color overlay that responds to lighting */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          animate={{
            backgroundColor: lightingState === "000" 
              ? "hsl(28 20% 18% / 0)" // All off - transparent (show base bg)
              : lightingState === "001" 
              ? "hsl(32 22% 20% / 0.15)" // Monitor only - subtle warm overlay
              : lightingState === "010"
              ? "hsl(34 24% 21% / 0.2)" // Desk lamp only - warm overlay
              : lightingState === "011"
              ? "hsl(36 25% 23% / 0.25)" // Desk + Monitor - warmer overlay
              : lightingState === "100"
              ? "hsl(35 23% 22% / 0.22)" // Spotlight only - bright warm overlay
              : lightingState === "101"
              ? "hsl(37 26% 24% / 0.28)" // Spotlight + Monitor - brighter overlay
              : lightingState === "110"
              ? "hsl(38 27% 25% / 0.3)" // Spotlight + Desk - very warm overlay
              : "hsl(40 28% 26% / 0.35)" // All on - brightest overlay
          }}
          transition={{
            duration: DURATION.lightOn,
            ease: EASING.smooth
          }}
        />

        {/* Ambient glow effects */}
        <AmbientGlowLayers
          spotlightIntensity={spotlightIntensity}
          deskLampIntensity={deskLampIntensity}
          monitorLightIntensity={monitorLightIntensity}
          allLightsOn={masterSwitchOn}
        />

      {/* Responsive Layout Container */}
      <motion.div 
        className="flex flex-col md:flex-row items-center gap-4 md:gap-8 max-w-7xl w-full relative z-10 px-5 md:px-0 md:pb-0"
        animate={{
          paddingBottom: showMediaPlayer ? '120px' : '80px'
        }}
        transition={{ 
          duration: 0.8, 
          ease: [0.19, 1, 0.22, 1] 
        }}
      >
        {/* Mobile: Room Info Header (Title, Climate, Master Switch) */}
        <motion.div 
          className="w-full md:hidden pt-8"
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
          <div className="flex items-start justify-between mb-3">
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
              className="w-12 h-12 rounded-full backdrop-blur-xl border-2 transition-all duration-500 flex-shrink-0"
              whileHover={{
                backgroundColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.15)',
              }}
              whileTap={{ scale: 0.92 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isLoaded ? 1 : 0,
                scale: isLoaded ? 1 : 0.8,
                backgroundColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0)',
                borderColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
              }}
              transition={{ 
                duration: 0.6,
                delay: 0.5,
                ease: [0.22, 0.03, 0.26, 1]
              }}
            >
              <motion.div
                animate={{
                  color: masterSwitchOn ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)'
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
            className="flex gap-6 mb-2"
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
          className="w-full md:w-[46%] relative"
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 40,
            scale: isLoaded ? 1 : 0.92
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
            duration: DURATION.lightOn,
            ease: EASING.smooth
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
            duration: DURATION.lightOn,
            ease: EASING.smooth
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
            duration: DURATION.lightOn,
            ease: EASING.smooth
          }}
            />
          </div>

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
          className="w-full md:w-[44%] md:pl-4"
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
            devices={[
              {
                id: "iphone",
                name: "Moty's iPhone",
                batteryLevel: iphoneBatteryLevel,
                isCharging: iphoneBatteryCharging,
                icon: 'smartphone' as const,
              },
              {
                id: "airpods",
                name: "AirPods Max",
                batteryLevel: 80,
                isCharging: false,
                icon: 'headphones' as const,
              }
            ]}
            lights={[
              { 
                id: 'deskLamp', 
                label: 'Desk Lamp', 
                intensity: deskLampIntensity,
                isPending: pendingLights.has('deskLamp'),
                isLoading: isConnected && !hasLoadedInitialState,
                onChange: createLightChangeHandler('deskLamp', setDeskLampIntensity)
              },
              { 
                id: 'monitorLight', 
                label: 'Monitor Back Light', 
                intensity: monitorLightIntensity,
                isPending: pendingLights.has('monitorLight'),
                isLoading: isConnected && !hasLoadedInitialState,
                onChange: createLightChangeHandler('monitorLight', setMonitorLightIntensity)
              },
              { 
                id: 'spotlight', 
                label: 'Spotlight', 
                intensity: spotlightIntensity,
                isPending: pendingLights.has('spotlight'),
                isLoading: isConnected && !hasLoadedInitialState,
                onChange: createLightChangeHandler('spotlight', setSpotlightIntensity)
              },
            ]}
            isLoaded={isLoaded}
          />
        </motion.div>
      </motion.div>
      </div>

      {/* Media Player - Sticky bottom player with delayed entrance */}
      {showMediaPlayer && (
        <MediaPlayer 
          entityId={entityMapping.mediaPlayer} 
          isConnected={isConnected}
        />
      )}
    </>
  );
};

export default Index;
