import { useState, useEffect } from "react";
import { homeAssistant, type HomeAssistantConfig, type EntityMapping } from "@/services/homeAssistant";

const CONFIG_KEY = "ha_config";
const ENTITY_MAPPING_KEY = "ha_entity_mapping";

export const useHomeAssistantConfig = () => {
  const [config, setConfig] = useState<HomeAssistantConfig | null>(null);
  const [entityMapping, setEntityMapping] = useState<EntityMapping>({});
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
        setEntityMapping(JSON.parse(savedMapping));
      } catch (e) {
        console.error("Failed to parse saved mapping:", e);
      }
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
