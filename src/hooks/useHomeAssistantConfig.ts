import { useState, useEffect } from "react";
import { homeAssistant, type HomeAssistantConfig, type EntityMapping } from "@/services/homeAssistant";

const CONFIG_KEY = "ha_config";
const ENTITY_MAPPING_KEY = "ha_entity_mapping";

const DEFAULT_ENTITY_MAPPING: EntityMapping = {
  deskLamp: "light.go",
  monitorLight: "light.screen",
  spotlight: "light.door",
  temperatureSensor: "sensor.dyson_pure_temperature",
  humiditySensor: "sensor.dyson_pure_humidity",
  airQualitySensor: "sensor.dyson_pure_pm_2_5",
  iphoneBatteryLevel: "sensor.motys_iphone_battery_level",
  iphoneBatteryState: "sensor.motys_iphone_battery_state",
};

export const useHomeAssistantConfig = () => {
  const [config, setConfig] = useState<HomeAssistantConfig | null>(null);
  const [entityMapping, setEntityMapping] = useState<EntityMapping>(DEFAULT_ENTITY_MAPPING);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    const savedMapping = localStorage.getItem(ENTITY_MAPPING_KEY);

    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        homeAssistant.setConfig(parsedConfig);
        setIsConnected(true);
      } catch (e) {
        console.error("Failed to parse saved config:", e);
      }
    }

    if (savedMapping) {
      try {
        const parsedMapping = JSON.parse(savedMapping);
        // Merge with defaults to add any new sensor mappings
        const mergedMapping = {
          ...DEFAULT_ENTITY_MAPPING,
          ...parsedMapping,
        };
        setEntityMapping(mergedMapping);
        // Save the merged mapping back to localStorage
        localStorage.setItem(ENTITY_MAPPING_KEY, JSON.stringify(mergedMapping));
      } catch (e) {
        console.error("Failed to parse saved mapping:", e);
        setEntityMapping(DEFAULT_ENTITY_MAPPING);
      }
    } else {
      // Use default mapping if no saved mapping exists
      setEntityMapping(DEFAULT_ENTITY_MAPPING);
    }
  }, []);

  const saveConfig = (newConfig: HomeAssistantConfig, newMapping: EntityMapping) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    localStorage.setItem(ENTITY_MAPPING_KEY, JSON.stringify(newMapping));
    setConfig(newConfig);
    setEntityMapping(newMapping);
    homeAssistant.setConfig(newConfig);
    setIsConnected(true);
  };

  const clearConfig = () => {
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(ENTITY_MAPPING_KEY);
    setConfig(null);
    setEntityMapping({});
    setIsConnected(false);
  };

  return {
    config,
    entityMapping,
    isConnected,
    saveConfig,
    clearConfig,
  };
};
