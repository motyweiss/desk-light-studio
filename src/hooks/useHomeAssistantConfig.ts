import { useState, useEffect } from "react";
import { homeAssistant, type HomeAssistantConfig, type EntityMapping } from "@/services/homeAssistant";
import { DevicesMapping, DeviceConfig } from "@/types/settings";

const CONFIG_KEY = "ha_config";
const ENTITY_MAPPING_KEY = "ha_entity_mapping";
const DEVICES_MAPPING_KEY = "ha_devices_mapping";
const RECENT_URLS_KEY = "ha_recent_urls";

const DEFAULT_ENTITY_MAPPING: EntityMapping = {
  deskLamp: "light.go",
  monitorLight: "light.screen",
  spotlight: "light.door",
  temperatureSensor: "sensor.dyson_pure_temperature",
  humiditySensor: "sensor.dyson_pure_humidity",
  airQualitySensor: "sensor.dyson_pure_pm_2_5",
  iphoneBatteryLevel: "sensor.motys_iphone_battery_level",
  iphoneBatteryState: "sensor.motys_iphone_battery_state",
  mediaPlayer: "media_player.spotify",
};

// Migration function: convert old EntityMapping to new DevicesMapping
const migrateToNewFormat = (oldMapping: EntityMapping): DevicesMapping => ({
  rooms: [{
    id: 'office',
    name: 'Office',
    lights: [
      { id: 'desk_lamp', label: 'Desk Lamp', entity_id: oldMapping.deskLamp || 'light.go' },
      { id: 'monitor_light', label: 'Monitor Light', entity_id: oldMapping.monitorLight || 'light.screen' },
      { id: 'spotlight', label: 'Spotlight', entity_id: oldMapping.spotlight || 'light.door' },
    ],
    sensors: [
      { id: 'temperature', label: 'Temperature', entity_id: oldMapping.temperatureSensor || 'sensor.dyson_pure_temperature', type: 'temperature' },
      { id: 'humidity', label: 'Humidity', entity_id: oldMapping.humiditySensor || 'sensor.dyson_pure_humidity', type: 'humidity' },
      { id: 'air_quality', label: 'Air Quality', entity_id: oldMapping.airQualitySensor || 'sensor.dyson_pure_pm_2_5', type: 'air_quality' },
    ],
    mediaPlayers: [
      { id: 'spotify', label: 'Spotify', entity_id: oldMapping.mediaPlayer || 'media_player.spotify' },
    ],
  }]
});

// Convert DevicesMapping back to EntityMapping (for backward compatibility)
const convertToLegacyFormat = (devicesMapping: DevicesMapping): EntityMapping => {
  const office = devicesMapping.rooms[0];
  return {
    deskLamp: office.lights.find(l => l.id === 'desk_lamp')?.entity_id || 'light.go',
    monitorLight: office.lights.find(l => l.id === 'monitor_light')?.entity_id || 'light.screen',
    spotlight: office.lights.find(l => l.id === 'spotlight')?.entity_id || 'light.door',
    temperatureSensor: office.sensors.find(s => s.type === 'temperature')?.entity_id || 'sensor.dyson_pure_temperature',
    humiditySensor: office.sensors.find(s => s.type === 'humidity')?.entity_id || 'sensor.dyson_pure_humidity',
    airQualitySensor: office.sensors.find(s => s.type === 'air_quality')?.entity_id || 'sensor.dyson_pure_pm_2_5',
    iphoneBatteryLevel: DEFAULT_ENTITY_MAPPING.iphoneBatteryLevel,
    iphoneBatteryState: DEFAULT_ENTITY_MAPPING.iphoneBatteryState,
    mediaPlayer: office.mediaPlayers[0]?.entity_id || 'media_player.spotify',
  };
};

export const useHomeAssistantConfig = () => {
  const [config, setConfig] = useState<HomeAssistantConfig | null>(null);
  const [entityMapping, setEntityMapping] = useState<EntityMapping>(DEFAULT_ENTITY_MAPPING);
  const [devicesMapping, setDevicesMapping] = useState<DevicesMapping>(migrateToNewFormat(DEFAULT_ENTITY_MAPPING));
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initConfig = async () => {
      // Load from localStorage
      const savedConfig = localStorage.getItem(CONFIG_KEY);
      const savedMapping = localStorage.getItem(ENTITY_MAPPING_KEY);
      const savedDevicesMapping = localStorage.getItem(DEVICES_MAPPING_KEY);

      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig);
          setConfig(parsedConfig);
          homeAssistant.setConfig(parsedConfig);
          setIsConnected(true);
        } catch (e) {
          console.error("Failed to parse saved config:", e);
        }
      } else {
        // Try to auto-connect using recent URLs if no saved config
        const recentUrlsStr = localStorage.getItem(RECENT_URLS_KEY);
        if (recentUrlsStr) {
          try {
            const recentUrls = JSON.parse(recentUrlsStr);
            if (recentUrls.length > 0 && recentUrls[0].url) {
              // Check if there's a saved token (separate from full config)
              const savedToken = localStorage.getItem('ha_token');
              if (savedToken) {
                const autoConfig = { baseUrl: recentUrls[0].url, accessToken: savedToken };
                homeAssistant.setConfig(autoConfig);
                
                try {
                  const result = await homeAssistant.testConnection();
                  if (result.success) {
                    console.log('🔌 Auto-connected using recent URL');
                    setConfig(autoConfig);
                    localStorage.setItem(CONFIG_KEY, JSON.stringify(autoConfig));
                    setIsConnected(true);
                  }
                } catch {
                  console.log('Auto-connect failed, user needs to configure manually');
                }
              }
            }
          } catch {
            console.log('Failed to parse recent URLs for auto-connect');
          }
        }
      }

      // Load DevicesMapping (prioritize new format)
      if (savedDevicesMapping) {
        try {
          const parsedDevicesMapping = JSON.parse(savedDevicesMapping);
          setDevicesMapping(parsedDevicesMapping);
          // Also set legacy entityMapping for backward compatibility
          setEntityMapping(convertToLegacyFormat(parsedDevicesMapping));
        } catch (e) {
          console.error("Failed to parse saved devices mapping:", e);
        }
      } else if (savedMapping) {
        // Migrate from old format
        try {
          const parsedMapping = JSON.parse(savedMapping);
          
          // Fix old media_player.living_room to media_player.spotify
          if (parsedMapping.mediaPlayer === 'media_player.living_room') {
            console.log('🔄 Migrating old media player entity to media_player.spotify');
            parsedMapping.mediaPlayer = 'media_player.spotify';
          }
          
          // Merge with defaults to add any new sensor mappings
          const mergedMapping = {
            ...DEFAULT_ENTITY_MAPPING,
            ...parsedMapping,
          };
          setEntityMapping(mergedMapping);
          
          // Migrate to new format
          const migratedDevicesMapping = migrateToNewFormat(mergedMapping);
          setDevicesMapping(migratedDevicesMapping);
          
          // Save both formats
          localStorage.setItem(ENTITY_MAPPING_KEY, JSON.stringify(mergedMapping));
          localStorage.setItem(DEVICES_MAPPING_KEY, JSON.stringify(migratedDevicesMapping));
        } catch (e) {
          console.error("Failed to parse saved mapping:", e);
          setEntityMapping(DEFAULT_ENTITY_MAPPING);
          setDevicesMapping(migrateToNewFormat(DEFAULT_ENTITY_MAPPING));
        }
      } else {
        // Use default mapping if no saved mapping exists
        setEntityMapping(DEFAULT_ENTITY_MAPPING);
        setDevicesMapping(migrateToNewFormat(DEFAULT_ENTITY_MAPPING));
      }
    };

    initConfig();
  }, []);

  const saveConfig = (newConfig: HomeAssistantConfig, newMapping: EntityMapping) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    localStorage.setItem(ENTITY_MAPPING_KEY, JSON.stringify(newMapping));
    // Save token separately for auto-connect feature
    localStorage.setItem('ha_token', newConfig.accessToken);
    setConfig(newConfig);
    setEntityMapping(newMapping);
    homeAssistant.setConfig(newConfig);
    setIsConnected(true);
  };

  const saveDevicesMapping = (newDevicesMapping: DevicesMapping) => {
    localStorage.setItem(DEVICES_MAPPING_KEY, JSON.stringify(newDevicesMapping));
    setDevicesMapping(newDevicesMapping);
    
    // Also update legacy format
    const legacyMapping = convertToLegacyFormat(newDevicesMapping);
    localStorage.setItem(ENTITY_MAPPING_KEY, JSON.stringify(legacyMapping));
    setEntityMapping(legacyMapping);
  };

  const addDevice = (roomId: string, category: 'lights' | 'sensors' | 'mediaPlayers', device: DeviceConfig) => {
    setDevicesMapping(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId 
          ? { ...room, [category]: [...room[category], device] }
          : room
      )
    }));
  };

  const updateDevice = (
    roomId: string, 
    category: 'lights' | 'sensors' | 'mediaPlayers', 
    deviceId: string, 
    updates: Partial<DeviceConfig>
  ) => {
    setDevicesMapping(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId 
          ? {
              ...room,
              [category]: room[category].map((device: DeviceConfig) =>
                device.id === deviceId ? { ...device, ...updates } : device
              )
            }
          : room
      )
    }));
  };

  const removeDevice = (roomId: string, category: 'lights' | 'sensors' | 'mediaPlayers', deviceId: string) => {
    setDevicesMapping(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId 
          ? {
              ...room,
              [category]: room[category].filter((device: DeviceConfig) => device.id !== deviceId)
            }
          : room
      )
    }));
  };

  const clearConfig = () => {
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(ENTITY_MAPPING_KEY);
    localStorage.removeItem(DEVICES_MAPPING_KEY);
    setConfig(null);
    setEntityMapping({});
    setDevicesMapping({ rooms: [] });
    setIsConnected(false);
  };

  return {
    config,
    entityMapping,
    devicesMapping,
    isConnected,
    saveConfig,
    saveDevicesMapping,
    addDevice,
    updateDevice,
    removeDevice,
    clearConfig,
  };
};
