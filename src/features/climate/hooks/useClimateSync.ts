import { useState, useCallback, useEffect } from 'react';
import { usePolling } from '@/shared/hooks';
import { sensors } from '@/api/homeAssistant';
import { logger } from '@/shared/utils/logger';

interface ClimateData {
  temperature: number;
  humidity: number;
  airQuality: number;
  iphoneBatteryLevel: number;
  iphoneBatteryCharging: boolean;
  airpodsMaxBatteryLevel: number;
  airpodsMaxBatteryCharging: boolean;
  isLoaded: boolean;
}

interface EntityMapping {
  temperatureSensor?: string;
  humiditySensor?: string;
  airQualitySensor?: string;
  iphoneBattery?: string;
  iphoneBatteryState?: string;
  airpodsMaxBattery?: string;
  airpodsMaxBatteryState?: string;
}

interface UseClimateSyncConfig {
  isConnected: boolean;
  entityMapping: EntityMapping;
  pollingInterval?: number;
}

/**
 * Unified climate and device battery synchronization
 */
export const useClimateSync = (config: UseClimateSyncConfig): ClimateData => {
  const { isConnected, entityMapping, pollingInterval = 5000 } = config;

  const [climateData, setClimateData] = useState<ClimateData>({
    temperature: 22,
    humidity: 45,
    airQuality: 5,
    iphoneBatteryLevel: 85,
    iphoneBatteryCharging: false,
    airpodsMaxBatteryLevel: 70,
    airpodsMaxBatteryCharging: false,
    isLoaded: false,
  });

  /**
   * Sync all climate sensors
   */
  const syncClimateData = useCallback(async () => {
    if (!isConnected) return;

    const entityIds = [
      entityMapping.temperatureSensor,
      entityMapping.humiditySensor,
      entityMapping.airQualitySensor,
      entityMapping.iphoneBattery,
      entityMapping.iphoneBatteryState,
      entityMapping.airpodsMaxBattery,
      entityMapping.airpodsMaxBatteryState,
    ].filter(Boolean) as string[];

    if (entityIds.length === 0) return;

    try {
      const states = await sensors.getMultipleStates(entityIds);

      setClimateData(prev => {
        const newData = { ...prev };

        // Temperature
        if (entityMapping.temperatureSensor && states[entityMapping.temperatureSensor]) {
          const temp = parseFloat(states[entityMapping.temperatureSensor]!.state);
          if (!isNaN(temp)) newData.temperature = temp;
        }

        // Humidity
        if (entityMapping.humiditySensor && states[entityMapping.humiditySensor]) {
          const humidity = parseFloat(states[entityMapping.humiditySensor]!.state);
          if (!isNaN(humidity)) newData.humidity = humidity;
        }

        // Air Quality
        if (entityMapping.airQualitySensor && states[entityMapping.airQualitySensor]) {
          const airQuality = parseFloat(states[entityMapping.airQualitySensor]!.state);
          if (!isNaN(airQuality)) newData.airQuality = airQuality;
        }

        // iPhone Battery
        if (entityMapping.iphoneBattery && states[entityMapping.iphoneBattery]) {
          const battery = parseFloat(states[entityMapping.iphoneBattery]!.state);
          if (!isNaN(battery)) newData.iphoneBatteryLevel = battery;
        }
        if (entityMapping.iphoneBatteryState && states[entityMapping.iphoneBatteryState]) {
          const state = states[entityMapping.iphoneBatteryState]!.state.toLowerCase();
          newData.iphoneBatteryCharging = state.includes('charging') && !state.includes('not');
        }

        // AirPods Battery
        if (entityMapping.airpodsMaxBattery && states[entityMapping.airpodsMaxBattery]) {
          const battery = parseFloat(states[entityMapping.airpodsMaxBattery]!.state);
          if (!isNaN(battery)) newData.airpodsMaxBatteryLevel = battery;
        }
        if (entityMapping.airpodsMaxBatteryState && states[entityMapping.airpodsMaxBatteryState]) {
          const state = states[entityMapping.airpodsMaxBatteryState]!.state.toLowerCase();
          newData.airpodsMaxBatteryCharging = state.includes('charging') && !state.includes('not');
        }

        newData.isLoaded = true;
        return newData;
      });
    } catch (error) {
      logger.error('Failed to sync climate data', error);
    }
  }, [isConnected, entityMapping]);

  // Immediate first sync on mount
  useEffect(() => {
    if (isConnected) {
      syncClimateData();
    }
  }, [isConnected, syncClimateData]);

  // Setup polling
  usePolling(syncClimateData, {
    interval: pollingInterval,
    enabled: isConnected,
    runOnFocus: true,
  });

  return climateData;
};
