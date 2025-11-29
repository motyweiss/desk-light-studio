import { useState, useEffect, useCallback } from 'react';
import { homeAssistant } from '@/services/homeAssistant';
import { POLL_INTERVAL } from '@/constants/animations';

interface EntityMapping {
  temperatureSensor?: string;
  humiditySensor?: string;
  airQualitySensor?: string;
  iphoneBatteryLevel?: string;
  iphoneBatteryState?: string;
  airpodsMaxBatteryLevel?: string;
  airpodsMaxBatteryState?: string;
}

interface UseClimateSyncConfig {
  isConnected: boolean;
  entityMapping: EntityMapping | null;
}

export const useClimateSync = (config: UseClimateSyncConfig) => {
  const { isConnected, entityMapping } = config;
  
  const [temperature, setTemperature] = useState(21.0);
  const [humidity, setHumidity] = useState(49);
  const [airQuality, setAirQuality] = useState(85);
  const [iphoneBatteryLevel, setIphoneBatteryLevel] = useState(0);
  const [iphoneBatteryCharging, setIphoneBatteryCharging] = useState(false);
  const [airpodsMaxBatteryLevel, setAirpodsMaxBatteryLevel] = useState(0);
  const [airpodsMaxBatteryCharging, setAirpodsMaxBatteryCharging] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const syncClimateData = useCallback(async () => {
    if (!isConnected || !entityMapping) return;

    const sensorEntityIds = [
      entityMapping.temperatureSensor,
      entityMapping.humiditySensor,
      entityMapping.airQualitySensor,
      entityMapping.iphoneBatteryLevel,
      entityMapping.iphoneBatteryState,
      entityMapping.airpodsMaxBatteryLevel,
      entityMapping.airpodsMaxBatteryState,
    ].filter(Boolean) as string[];

    if (sensorEntityIds.length === 0) return;

    try {
      const states = await homeAssistant.getAllEntityStates(sensorEntityIds);

      if (entityMapping.temperatureSensor && states.has(entityMapping.temperatureSensor)) {
        const state = states.get(entityMapping.temperatureSensor)!;
        const tempValue = parseFloat(state.state);
        if (!isNaN(tempValue)) {
          setTemperature(tempValue);
        }
      }

      if (entityMapping.humiditySensor && states.has(entityMapping.humiditySensor)) {
        const state = states.get(entityMapping.humiditySensor)!;
        const humidityValue = parseFloat(state.state);
        if (!isNaN(humidityValue)) {
          setHumidity(Math.round(humidityValue));
        }
      }

      if (entityMapping.airQualitySensor && states.has(entityMapping.airQualitySensor)) {
        const state = states.get(entityMapping.airQualitySensor)!;
        const aqValue = parseFloat(state.state);
        if (!isNaN(aqValue)) {
          setAirQuality(Math.round(aqValue));
        }
      }

      if (entityMapping.iphoneBatteryLevel && states.has(entityMapping.iphoneBatteryLevel)) {
        const state = states.get(entityMapping.iphoneBatteryLevel)!;
        const batteryValue = parseFloat(state.state);
        if (!isNaN(batteryValue)) {
          setIphoneBatteryLevel(Math.round(batteryValue));
        }
      }

      if (entityMapping.iphoneBatteryState && states.has(entityMapping.iphoneBatteryState)) {
        const state = states.get(entityMapping.iphoneBatteryState)!;
        const isCharging = state.state.toLowerCase().includes('charging') && !state.state.toLowerCase().includes('not');
        setIphoneBatteryCharging(isCharging);
      }

      if (entityMapping.airpodsMaxBatteryLevel && states.has(entityMapping.airpodsMaxBatteryLevel)) {
        const state = states.get(entityMapping.airpodsMaxBatteryLevel)!;
        const batteryValue = parseFloat(state.state);
        if (!isNaN(batteryValue)) {
          setAirpodsMaxBatteryLevel(Math.round(batteryValue));
        }
      }

      if (entityMapping.airpodsMaxBatteryState && states.has(entityMapping.airpodsMaxBatteryState)) {
        const state = states.get(entityMapping.airpodsMaxBatteryState)!;
        const isCharging = state.state.toLowerCase().includes('charging') && !state.state.toLowerCase().includes('not');
        setAirpodsMaxBatteryCharging(isCharging);
      }

      if (!isLoaded) {
        setIsLoaded(true);
      }
    } catch (error) {
      console.error('❌ Failed to sync climate data:', error);
    }
  }, [isConnected, entityMapping, isLoaded]);

  // Initial sync
  useEffect(() => {
    if (isConnected && entityMapping) {
      syncClimateData();
    }
  }, [isConnected, entityMapping, syncClimateData]);

  // Polling sync
  useEffect(() => {
    if (!isConnected || !entityMapping) return;

    const intervalId = setInterval(syncClimateData, POLL_INTERVAL.sensors);

    return () => clearInterval(intervalId);
  }, [isConnected, entityMapping, syncClimateData]);

  // Window focus sync
  useEffect(() => {
    const handleFocus = () => {
      if (isConnected && entityMapping) {
        syncClimateData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isConnected, entityMapping, syncClimateData]);

  return {
    temperature,
    humidity,
    airQuality,
    iphoneBatteryLevel,
    iphoneBatteryCharging,
    airpodsMaxBatteryLevel,
    airpodsMaxBatteryCharging,
    isLoaded,
  };
};
