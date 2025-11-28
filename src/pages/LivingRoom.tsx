import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { SettingsButton } from "@/components/SettingsButton";
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator";
import { SettingsDialog } from "@/components/SettingsDialog";
import { MediaPlayer } from "@/components/MediaPlayer/MediaPlayer";
import { RoomNavigation } from "@/components/RoomNavigation";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useHomeAssistantConfig } from "@/hooks/useHomeAssistantConfig";
import { homeAssistant } from "@/services/homeAssistant";

// Import desk image (using same image as office for now)
import deskImage from "@/assets/desk-000.png";

const LivingRoom = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  
  // Light states for living room
  const [ceilingLightIntensity, setCeilingLightIntensity] = useState(0);
  const [floorLampIntensity, setFloorLampIntensity] = useState(0);
  const [tvBacklightIntensity, setTvBacklightIntensity] = useState(0);
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasLoadedInitialState, setHasLoadedInitialState] = useState(false);
  
  // Climate sensor states
  const [temperature, setTemperature] = useState(22.5);
  const [humidity, setHumidity] = useState(52);
  const [airQuality, setAirQuality] = useState(15);
  
  // Device battery states - AirPods Max
  const [airpodsMaxBatteryLevel, setAirpodsMaxBatteryLevel] = useState(0);
  const [airpodsMaxBatteryCharging, setAirpodsMaxBatteryCharging] = useState(false);
  
  // Hover states
  const [hoveredLight, setHoveredLight] = useState<string | null>(null);
  
  const lastManualChangeRef = useRef<number>(0);
  const [pendingLights, setPendingLights] = useState<Set<string>>(new Set());
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectAttemptRef = useRef(0);
  
  const { toast } = useToast();
  const { config, entityMapping, isConnected, saveConfig } = useHomeAssistantConfig();

  useEffect(() => {
    if (!isConnected) {
      setHasLoadedInitialState(false);
    }
  }, [isConnected]);

  // Optimized image loading
  useEffect(() => {
    const startTime = Date.now();
    const minLoadTime = 500;
    
    const image = new Image();
    image.src = deskImage;
    
    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => {
          setIsLoaded(true);
          setTimeout(() => {
            setShowMediaPlayer(true);
          }, 2000);
        }, 100);
      }, remainingTime);
    };
    
    image.onload = handleLoad;
    
    const fallbackTimer = setTimeout(() => {
      handleLoad();
    }, 8000 + minLoadTime);
    
    return () => clearTimeout(fallbackTimer);
  }, []);

  // Master switch logic
  const allLightsOn = ceilingLightIntensity > 0 || floorLampIntensity > 0 || tvBacklightIntensity > 0;
  const masterSwitchOn = allLightsOn;

  const handleMasterToggle = useCallback(async (checked: boolean) => {
    const startTime = Date.now();
    lastManualChangeRef.current = startTime;
    const targetIntensity = checked ? 100 : 0;
    
    console.log(`🎛️  LIVING ROOM MASTER TOGGLE: ${checked ? 'ON' : 'OFF'} (target: ${targetIntensity}%)`);
    
    setPendingLights(new Set(['ceilingLight', 'floorLamp', 'tvBacklight']));
    
    setCeilingLightIntensity(targetIntensity);
    setFloorLampIntensity(targetIntensity);
    setTvBacklightIntensity(targetIntensity);

    if (isConnected && entityMapping) {
      console.log('📤 Sending master toggle to Home Assistant...');
      const promises = [];
      
      if (entityMapping.livingRoomCeilingLight) {
        promises.push(
          homeAssistant.setLightBrightness(entityMapping.livingRoomCeilingLight, targetIntensity)
            .then(() => console.log(`  ✅ Ceiling Light → ${targetIntensity}%`))
            .catch(err => console.error(`  ❌ Ceiling Light failed:`, err))
        );
      }
      if (entityMapping.livingRoomFloorLamp) {
        promises.push(
          homeAssistant.setLightBrightness(entityMapping.livingRoomFloorLamp, targetIntensity)
            .then(() => console.log(`  ✅ Floor Lamp → ${targetIntensity}%`))
            .catch(err => console.error(`  ❌ Floor Lamp failed:`, err))
        );
      }
      if (entityMapping.livingRoomTvBacklight) {
        promises.push(
          homeAssistant.setLightBrightness(entityMapping.livingRoomTvBacklight, targetIntensity)
            .then(() => console.log(`  ✅ TV Backlight → ${targetIntensity}%`))
            .catch(err => console.error(`  ❌ TV Backlight failed:`, err))
        );
      }
      
      await Promise.all(promises);
      const duration = Date.now() - startTime;
      console.log(`⏱️  Master toggle completed in ${duration}ms`);
      
      setTimeout(() => {
        setPendingLights(new Set());
      }, 500);
    } else {
      console.log('⚠️  Master toggle: Not connected to HA, local only');
      setPendingLights(new Set());
    }
  }, [isConnected, entityMapping]);

  const createLightChangeHandler = useCallback((lightId: string, setter: (value: number) => void) => {
    return async (newIntensity: number) => {
      const startTime = Date.now();
      lastManualChangeRef.current = startTime;
      
      console.log(`💡 LIVING ROOM MANUAL CHANGE: ${lightId} → ${newIntensity}%`);
      
      setPendingLights(prev => new Set(prev).add(lightId));
      setter(newIntensity);

      if (isConnected && entityMapping) {
        const entityId = lightId === "ceilingLight" 
          ? entityMapping.livingRoomCeilingLight 
          : lightId === "floorLamp" 
          ? entityMapping.livingRoomFloorLamp 
          : entityMapping.livingRoomTvBacklight;

        if (entityId) {
          console.log(`📤 Sending to HA: ${entityId} → ${newIntensity}%`);
          try {
            await homeAssistant.setLightBrightness(entityId, newIntensity);
            const duration = Date.now() - startTime;
            console.log(`  ✅ Success in ${duration}ms`);
            
            setTimeout(() => {
              setPendingLights(prev => {
                const next = new Set(prev);
                next.delete(lightId);
                return next;
              });
            }, 500);
          } catch (error) {
            console.error(`  ❌ Failed to sync ${lightId}:`, error);
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
  }, [isConnected, entityMapping]);

  const handleSaveSettings = (
    newConfig: { baseUrl: string; accessToken: string },
    newMapping: any
  ) => {
    saveConfig(newConfig, newMapping);
    toast({
      title: "✓ Connected to Home Assistant",
      description: "Your devices are now synced",
    });
  };

  // Initial sync on page load
  useEffect(() => {
    if (!isConnected || !entityMapping) return;

    const initialSync = async () => {
      const lightEntityIds = [
        entityMapping.livingRoomCeilingLight,
        entityMapping.livingRoomFloorLamp,
        entityMapping.livingRoomTvBacklight,
      ].filter(Boolean) as string[];
      
      const sensorEntityIds = [
        entityMapping.livingRoomTemperatureSensor,
        entityMapping.livingRoomHumiditySensor,
        entityMapping.livingRoomAirQualitySensor,
        entityMapping.airpodsMaxBatteryLevel,
        entityMapping.airpodsMaxBatteryState,
      ].filter(Boolean) as string[];

      const allEntityIds = [...lightEntityIds, ...sensorEntityIds];
      if (allEntityIds.length === 0) return;

      console.log("🔄 Living Room initial sync from Home Assistant");

      try {
        const states = await homeAssistant.getAllEntityStates(allEntityIds);
        
        // Update lights
        if (entityMapping.livingRoomCeilingLight && states.has(entityMapping.livingRoomCeilingLight)) {
          const state = states.get(entityMapping.livingRoomCeilingLight)!;
          const newIntensity = state.state === "on" 
            ? Math.round((state.brightness || 255) / 255 * 100)
            : 0;
          setCeilingLightIntensity(newIntensity);
          console.log(`💡 Ceiling Light initial: ${newIntensity}%`);
        }

        if (entityMapping.livingRoomFloorLamp && states.has(entityMapping.livingRoomFloorLamp)) {
          const state = states.get(entityMapping.livingRoomFloorLamp)!;
          const newIntensity = state.state === "on" 
            ? Math.round((state.brightness || 255) / 255 * 100)
            : 0;
          setFloorLampIntensity(newIntensity);
          console.log(`💡 Floor Lamp initial: ${newIntensity}%`);
        }

        if (entityMapping.livingRoomTvBacklight && states.has(entityMapping.livingRoomTvBacklight)) {
          const state = states.get(entityMapping.livingRoomTvBacklight)!;
          const newIntensity = state.state === "on" 
            ? Math.round((state.brightness || 255) / 255 * 100)
            : 0;
          setTvBacklightIntensity(newIntensity);
          console.log(`💡 TV Backlight initial: ${newIntensity}%`);
        }
        
        // Update sensors
        if (entityMapping.livingRoomTemperatureSensor && states.has(entityMapping.livingRoomTemperatureSensor)) {
          const state = states.get(entityMapping.livingRoomTemperatureSensor)!;
          const tempValue = parseFloat(state.state);
          if (!isNaN(tempValue)) {
            setTemperature(tempValue);
            console.log(`🌡️ Temperature initial: ${tempValue}°C`);
          }
        }
        
        if (entityMapping.livingRoomHumiditySensor && states.has(entityMapping.livingRoomHumiditySensor)) {
          const state = states.get(entityMapping.livingRoomHumiditySensor)!;
          const humidityValue = parseFloat(state.state);
          if (!isNaN(humidityValue)) {
            setHumidity(Math.round(humidityValue));
            console.log(`💧 Humidity initial: ${humidityValue}%`);
          }
        }
        
        if (entityMapping.livingRoomAirQualitySensor && states.has(entityMapping.livingRoomAirQualitySensor)) {
          const state = states.get(entityMapping.livingRoomAirQualitySensor)!;
          const aqValue = parseFloat(state.state);
          if (!isNaN(aqValue)) {
            setAirQuality(Math.round(aqValue));
            console.log(`🌬️ Air Quality initial: ${aqValue}`);
          }
        }
        
        // Update AirPods Max battery
        if (entityMapping.airpodsMaxBatteryLevel && states.has(entityMapping.airpodsMaxBatteryLevel)) {
          const state = states.get(entityMapping.airpodsMaxBatteryLevel)!;
          const batteryValue = parseFloat(state.state);
          if (!isNaN(batteryValue)) {
            setAirpodsMaxBatteryLevel(Math.round(batteryValue));
            console.log(`🎧 AirPods Max Battery initial: ${batteryValue}%`);
          }
        }
        
        if (entityMapping.airpodsMaxBatteryState && states.has(entityMapping.airpodsMaxBatteryState)) {
          const state = states.get(entityMapping.airpodsMaxBatteryState)!;
          const isCharging = state.state.toLowerCase().includes("charging") && !state.state.toLowerCase().includes("not");
          setAirpodsMaxBatteryCharging(isCharging);
          console.log(`⚡ AirPods Max Charging initial: ${state.state} → ${isCharging}`);
        }
        
        setHasLoadedInitialState(true);
      } catch (error) {
        console.error("❌ Failed to perform Living Room initial sync:", error);
        setIsReconnecting(true);
        toast({
          title: "Connection Failed",
          description: "Unable to connect to Home Assistant. Retrying...",
          variant: "destructive",
        });
      }
    };

    initialSync();
  }, [isConnected, entityMapping]);

  // Light data for RoomInfoPanel
  const lights = [
    {
      id: "ceilingLight",
      label: "Ceiling Light",
      intensity: ceilingLightIntensity,
      onChange: createLightChangeHandler("ceilingLight", setCeilingLightIntensity),
      isPending: pendingLights.has("ceilingLight"),
      isHovered: hoveredLight === "ceilingLight",
      onHoverChange: (hovered: boolean) => setHoveredLight(hovered ? "ceilingLight" : null),
    },
    {
      id: "floorLamp",
      label: "Floor Lamp",
      intensity: floorLampIntensity,
      onChange: createLightChangeHandler("floorLamp", setFloorLampIntensity),
      isPending: pendingLights.has("floorLamp"),
      isHovered: hoveredLight === "floorLamp",
      onHoverChange: (hovered: boolean) => setHoveredLight(hovered ? "floorLamp" : null),
    },
    {
      id: "tvBacklight",
      label: "TV Backlight",
      intensity: tvBacklightIntensity,
      onChange: createLightChangeHandler("tvBacklight", setTvBacklightIntensity),
      isPending: pendingLights.has("tvBacklight"),
      isHovered: hoveredLight === "tvBacklight",
      onHoverChange: (hovered: boolean) => setHoveredLight(hovered ? "tvBacklight" : null),
    },
  ];

  // Device battery info
  const devices = [
    {
      id: "airpods-max",
      name: "AirPods Max",
      batteryLevel: airpodsMaxBatteryLevel,
      isCharging: airpodsMaxBatteryCharging,
      icon: "headphones" as const,
    },
  ];

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <Toaster />
      
      <RoomNavigation />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="min-h-[100dvh] w-full flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden"
        style={{ 
          background: '#96856e',
          paddingTop: '80px', // Account for navigation bar
        }}
      >
        {/* Settings and Connection Status (Desktop only) */}
        <div className="hidden md:flex fixed top-20 right-8 z-50 gap-4">
          <ConnectionStatusIndicator 
            isConnected={isConnected} 
            isReconnecting={isReconnecting}
          />
          <SettingsButton onClick={() => setSettingsOpen(true)} />
        </div>

        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onSave={handleSaveSettings}
          currentConfig={config}
          currentMapping={entityMapping}
        />

        {/* Main Content Container */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-start justify-center gap-8 md:gap-12">
          {/* Right Panel - Room Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full md:w-[480px] order-1 md:order-2"
          >
            <RoomInfoPanel
              roomName="Living Room"
              temperature={temperature}
              humidity={humidity}
              airQuality={airQuality}
              lights={lights}
              masterSwitchOn={masterSwitchOn}
              onMasterToggle={handleMasterToggle}
              isLoaded={isLoaded}
              devices={devices}
              onLightHover={(lightId) => setHoveredLight(lightId)}
            />
          </motion.div>

          {/* Left - Image Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full md:w-[600px] order-2 md:order-1"
          >
            <div className="relative w-full aspect-[4/3]">
              <img
                src={deskImage}
                alt="Living Room"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Media Player */}
      {showMediaPlayer && (
        <MediaPlayer 
          entityId={entityMapping?.mediaPlayer || "media_player.spotify"}
          isConnected={isConnected}
        />
      )}
    </>
  );
};

export default LivingRoom;
