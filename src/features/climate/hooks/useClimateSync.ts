import { useState, useCallback, useEffect } from 'react';
import { usePolling } from '@/shared/hooks';
import { sensors } from '@/api/homeAssistant';
import { haProxyClient } from '@/services/haProxyClient';
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
    // Check if haProxyClient is configured
    if (!haProxyClient.getDirectConfig()) {
      logger.warn('HA client not configured, skipping climate sync');
      return;
    }
    
    if (!isConnected) {
      logger.warn('Not connected to HA, skipping climate sync');
      return;
    }

    // Debug: Log the entity mapping received
    console.log('🔋 [ClimateSync] Entity mapping received:', {
      iphoneBattery: entityMapping.iphoneBattery,
      iphoneBatteryState: entityMapping.iphoneBatteryState,
      airpodsMaxBattery: entityMapping.airpodsMaxBattery,
      airpodsMaxBatteryState: entityMapping.airpodsMaxBatteryState,
    });

    const entityIds = [
      entityMapping.temperatureSensor,
      entityMapping.humiditySensor,
      entityMapping.airQualitySensor,
      entityMapping.iphoneBattery,
      entityMapping.iphoneBatteryState,
      entityMapping.airpodsMaxBattery,
      entityMapping.airpodsMaxBatteryState,
    ].filter(Boolean) as string[];

    console.log('🔋 [ClimateSync] Querying entity IDs:', entityIds);

    // If no entities configured, mark as loaded with defaults
    if (entityIds.length === 0) {
      logger.warn('No climate entities configured');
      setClimateData(prev => ({ ...prev, isLoaded: true }));
      return;
    }

    try {
      logger.info('Syncing climate data...');
      const states = await sensors.getMultipleStates(entityIds);
      
      // Debug: Log raw states received
      console.log('🔋 [ClimateSync] Raw states received:', states);
      
      // Debug: Log iPhone battery specifically
      if (entityMapping.iphoneBattery) {
        const batteryState = states[entityMapping.iphoneBattery];
        console.log('🔋 [ClimateSync] iPhone battery entity:', entityMapping.iphoneBattery, '→', batteryState);
      }
      if (entityMapping.iphoneBatteryState) {
        const chargingState = states[entityMapping.iphoneBatteryState];
        console.log('🔋 [ClimateSync] iPhone charging entity:', entityMapping.iphoneBatteryState, '→', chargingState);
      }

      setClimateData(prev => {
        const newData = { ...prev };
        let hasAnyClimateData = false;

        // Temperature
        if (entityMapping.temperatureSensor && states[entityMapping.temperatureSensor]) {
          const temp = parseFloat(states[entityMapping.temperatureSensor]!.state);
          if (!isNaN(temp)) {
            newData.temperature = temp;
            hasAnyClimateData = true;
          }
        }

        // Humidity
        if (entityMapping.humiditySensor && states[entityMapping.humiditySensor]) {
          const humidity = parseFloat(states[entityMapping.humiditySensor]!.state);
          if (!isNaN(humidity)) {
            newData.humidity = humidity;
            hasAnyClimateData = true;
          }
        }

        // Air Quality
        if (entityMapping.airQualitySensor && states[entityMapping.airQualitySensor]) {
          const airQuality = parseFloat(states[entityMapping.airQualitySensor]!.state);
          if (!isNaN(airQuality)) {
            newData.airQuality = airQuality;
            hasAnyClimateData = true;
          }
        }

        // iPhone Battery (optional - doesn't affect isLoaded for climate)
        if (entityMapping.iphoneBattery && states[entityMapping.iphoneBattery]) {
          const battery = parseFloat(states[entityMapping.iphoneBattery]!.state);
          if (!isNaN(battery)) newData.iphoneBatteryLevel = battery;
        }
        if (entityMapping.iphoneBatteryState && states[entityMapping.iphoneBatteryState]) {
          const state = states[entityMapping.iphoneBatteryState]!.state.toLowerCase();
          newData.iphoneBatteryCharging = state.includes('charging') && !state.includes('not');
        }

        // AirPods Battery (optional - doesn't affect isLoaded for climate)
        if (entityMapping.airpodsMaxBattery && states[entityMapping.airpodsMaxBattery]) {
          const battery = parseFloat(states[entityMapping.airpodsMaxBattery]!.state);
          if (!isNaN(battery)) newData.airpodsMaxBatteryLevel = battery;
        }
        if (entityMapping.airpodsMaxBatteryState && states[entityMapping.airpodsMaxBatteryState]) {
          const state = states[entityMapping.airpodsMaxBatteryState]!.state.toLowerCase();
          newData.airpodsMaxBatteryCharging = state.includes('charging') && !state.includes('not');
        }

        // Mark as loaded if we have ANY climate data (temp, humidity, or air quality)
        // Don't wait for battery sensors which might be offline
        if (hasAnyClimateData) {
          newData.isLoaded = true;
        }
        
        // Debug: Log final parsed values
        console.log('🔋 [ClimateSync] Final parsed values:', {
          temperature: newData.temperature,
          humidity: newData.humidity,
          airQuality: newData.airQuality,
          hasAnyClimateData,
          isLoaded: newData.isLoaded,
        });
        
        logger.info('Climate data synced successfully');
        return newData;
      });
    } catch (error) {
      logger.error('Failed to sync climate data', error);
      console.error('🔋 [ClimateSync] Error syncing:', error);
      // Still mark as loaded on error to prevent infinite loading
      setClimateData(prev => ({ ...prev, isLoaded: true }));
    }
  }, [isConnected, entityMapping]);

  // Initial sync and entity discovery
  useEffect(() => {
    if (isConnected && haProxyClient.getDirectConfig()) {
      logger.info('Initial climate sync triggered');
      syncClimateData();
    }
  }, [isConnected, syncClimateData]);

  // Setup polling - only when connected AND haProxyClient is configured
  const shouldPoll = isConnected && !!haProxyClient.getDirectConfig();
  
  usePolling(syncClimateData, {
    interval: pollingInterval,
    enabled: shouldPoll,
    runOnFocus: true,
  });

  return climateData;
};
