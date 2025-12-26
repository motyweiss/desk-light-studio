import { useEffect, useCallback, useRef, useState } from 'react';
import { homeAssistant } from '@/services/homeAssistant';
import { connectionManager } from '@/services/ConnectionManager';
import { logger } from '@/shared/utils/logger';
import { POLL_INTERVAL, BLOCKING_WINDOW } from '@/constants/animations';
import { useToast } from '@/hooks/use-toast';

interface EntityMapping {
  spotlight?: string;
  deskLamp?: string;
  monitorLight?: string;
  temperatureSensor?: string;
  humiditySensor?: string;
  airQualitySensor?: string;
  iphoneBatteryLevel?: string;
  iphoneBatteryState?: string;
}

interface LightStates {
  spotlight: number;
  deskLamp: number;
  monitorLight: number;
}

interface SensorStates {
  temperature: number;
  humidity: number;
  airQuality: number;
  iphoneBatteryLevel: number;
  iphoneBatteryCharging: boolean;
}

interface UseHomeAssistantSyncConfig {
  isConnected: boolean;
  entityMapping: EntityMapping | null;
  pendingLights: Set<string>;
  onLightsUpdate: (lights: Partial<LightStates>) => void;
  onSensorsUpdate: (sensors: Partial<SensorStates>) => void;
  onReconnectingChange: (isReconnecting: boolean) => void;
}

export const useHomeAssistantSync = (config: UseHomeAssistantSyncConfig) => {
  const {
    isConnected,
    entityMapping,
    pendingLights,
    onLightsUpdate,
    onSensorsUpdate,
    onReconnectingChange
  } = config;

  const { toast } = useToast();
  const lastManualChangeRef = useRef<number>(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  // Subscribe to ConnectionManager state changes
  useEffect(() => {
    const unsubscribe = connectionManager.subscribe((state) => {
      const reconnecting = state === 'reconnecting' || state === 'connecting';
      setIsReconnecting(reconnecting);
      onReconnectingChange(reconnecting);
    });

    return () => unsubscribe();
  }, [onReconnectingChange]);

  // Helper to update a single light
  const updateLight = useCallback((
    lightId: string,
    brightness: number | undefined,
    state: string
  ): number | null => {
    // Skip if light is pending HA confirmation
    if (pendingLights.has(lightId)) {
      return null;
    }

    // Only skip update if manual change happened recently
    const timeSinceManualChange = Date.now() - lastManualChangeRef.current;
    if (timeSinceManualChange < BLOCKING_WINDOW.manualChange) {
      return null;
    }

    const newIntensity = state === 'on' ? Math.round((brightness || 255) / 255 * 100) : 0;
    return newIntensity;
  }, [pendingLights]);

  // Force sync function - immediate sync without conditions
  const forceSyncStates = useCallback(async () => {
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
      entityMapping.iphoneBatteryLevel,
      entityMapping.iphoneBatteryState,
    ].filter(Boolean) as string[];

    const allEntityIds = [...lightEntityIds, ...sensorEntityIds];
    if (allEntityIds.length === 0) return;

    try {
      const states = await homeAssistant.getAllEntityStates(allEntityIds);

      const lightUpdates: Partial<LightStates> = {};
      const sensorUpdates: Partial<SensorStates> = {};

      // Update lights
      if (entityMapping.spotlight && states.has(entityMapping.spotlight)) {
        const state = states.get(entityMapping.spotlight)!;
        const newIntensity = state.state === 'on'
          ? Math.round((state.brightness || 255) / 255 * 100)
          : 0;
        lightUpdates.spotlight = newIntensity;
      }

      if (entityMapping.deskLamp && states.has(entityMapping.deskLamp)) {
        const state = states.get(entityMapping.deskLamp)!;
        const newIntensity = state.state === 'on'
          ? Math.round((state.brightness || 255) / 255 * 100)
          : 0;
        lightUpdates.deskLamp = newIntensity;
      }

      if (entityMapping.monitorLight && states.has(entityMapping.monitorLight)) {
        const state = states.get(entityMapping.monitorLight)!;
        const newIntensity = state.state === 'on'
          ? Math.round((state.brightness || 255) / 255 * 100)
          : 0;
        lightUpdates.monitorLight = newIntensity;
      }

      // Update sensors
      if (entityMapping.temperatureSensor && states.has(entityMapping.temperatureSensor)) {
        const state = states.get(entityMapping.temperatureSensor)!;
        const tempValue = parseFloat(state.state);
        if (!isNaN(tempValue)) {
          sensorUpdates.temperature = tempValue;
        }
      }

      if (entityMapping.humiditySensor && states.has(entityMapping.humiditySensor)) {
        const state = states.get(entityMapping.humiditySensor)!;
        const humidityValue = parseFloat(state.state);
        if (!isNaN(humidityValue)) {
          sensorUpdates.humidity = Math.round(humidityValue);
        }
      }

      if (entityMapping.airQualitySensor && states.has(entityMapping.airQualitySensor)) {
        const state = states.get(entityMapping.airQualitySensor)!;
        const aqValue = parseFloat(state.state);
        if (!isNaN(aqValue)) {
          sensorUpdates.airQuality = Math.round(aqValue);
        }
      }

      if (entityMapping.iphoneBatteryLevel && states.has(entityMapping.iphoneBatteryLevel)) {
        const state = states.get(entityMapping.iphoneBatteryLevel)!;
        const batteryValue = parseFloat(state.state);
        if (!isNaN(batteryValue)) {
          sensorUpdates.iphoneBatteryLevel = Math.round(batteryValue);
        }
      }

      if (entityMapping.iphoneBatteryState && states.has(entityMapping.iphoneBatteryState)) {
        const state = states.get(entityMapping.iphoneBatteryState)!;
        const isCharging = state.state.toLowerCase().includes('charging') && !state.state.toLowerCase().includes('not');
        sensorUpdates.iphoneBatteryCharging = isCharging;
      }

      onLightsUpdate(lightUpdates);
      onSensorsUpdate(sensorUpdates);
      
      // Mark successful sync
      connectionManager.markSuccessfulSync();
    } catch (error) {
      logger.error('Force sync failed:', error);
    }
  }, [isConnected, entityMapping, onLightsUpdate, onSensorsUpdate]);

  // Track last manual change timestamp
  const markManualChange = useCallback(() => {
    lastManualChangeRef.current = Date.now();
  }, []);

  // Manual reconnect attempt - delegates to ConnectionManager
  const attemptReconnect = useCallback(async () => {
    if (isReconnecting) return;
    
    try {
      await connectionManager.reconnect();
      await forceSyncStates();
      toast({ 
        title: 'Connected', 
        description: 'Home Assistant reconnected successfully' 
      });
    } catch (error) {
      toast({ 
        title: 'Connection Failed', 
        description: 'Could not connect to Home Assistant',
        variant: 'destructive'
      });
    }
  }, [isReconnecting, forceSyncStates, toast]);

  // Polling sync effect
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
      entityMapping.iphoneBatteryLevel,
      entityMapping.iphoneBatteryState,
    ].filter(Boolean) as string[];

    const allEntityIds = [...lightEntityIds, ...sensorEntityIds];
    if (allEntityIds.length === 0) return;

    const syncStates = async () => {
      try {
        const states = await homeAssistant.getAllEntityStates(allEntityIds);

        const lightUpdates: Partial<LightStates> = {};
        const sensorUpdates: Partial<SensorStates> = {};

        // Update lights
        if (entityMapping.spotlight && states.has(entityMapping.spotlight)) {
          const state = states.get(entityMapping.spotlight)!;
          const newIntensity = updateLight('spotlight', state.brightness, state.state);
          if (newIntensity !== null) {
            lightUpdates.spotlight = newIntensity;
          }
        }

        if (entityMapping.deskLamp && states.has(entityMapping.deskLamp)) {
          const state = states.get(entityMapping.deskLamp)!;
          const newIntensity = updateLight('deskLamp', state.brightness, state.state);
          if (newIntensity !== null) {
            lightUpdates.deskLamp = newIntensity;
          }
        }

        if (entityMapping.monitorLight && states.has(entityMapping.monitorLight)) {
          const state = states.get(entityMapping.monitorLight)!;
          const newIntensity = updateLight('monitorLight', state.brightness, state.state);
          if (newIntensity !== null) {
            lightUpdates.monitorLight = newIntensity;
          }
        }

        // Update sensors
        if (entityMapping.temperatureSensor && states.has(entityMapping.temperatureSensor)) {
          const state = states.get(entityMapping.temperatureSensor)!;
          const tempValue = parseFloat(state.state);
          if (!isNaN(tempValue)) {
            sensorUpdates.temperature = tempValue;
          }
        }

        if (entityMapping.humiditySensor && states.has(entityMapping.humiditySensor)) {
          const state = states.get(entityMapping.humiditySensor)!;
          const humidityValue = parseFloat(state.state);
          if (!isNaN(humidityValue)) {
            sensorUpdates.humidity = Math.round(humidityValue);
          }
        }

        if (entityMapping.airQualitySensor && states.has(entityMapping.airQualitySensor)) {
          const state = states.get(entityMapping.airQualitySensor)!;
          const aqValue = parseFloat(state.state);
          if (!isNaN(aqValue)) {
            sensorUpdates.airQuality = Math.round(aqValue);
          }
        }

        if (entityMapping.iphoneBatteryLevel && states.has(entityMapping.iphoneBatteryLevel)) {
          const state = states.get(entityMapping.iphoneBatteryLevel)!;
          const batteryValue = parseFloat(state.state);
          if (!isNaN(batteryValue)) {
            sensorUpdates.iphoneBatteryLevel = Math.round(batteryValue);
          }
        }

        if (entityMapping.iphoneBatteryState && states.has(entityMapping.iphoneBatteryState)) {
          const state = states.get(entityMapping.iphoneBatteryState)!;
          const isCharging = state.state.toLowerCase().includes('charging') && !state.state.toLowerCase().includes('not');
          sensorUpdates.iphoneBatteryCharging = isCharging;
        }

        // Notify parent of updates
        if (Object.keys(lightUpdates).length > 0) {
          onLightsUpdate(lightUpdates);
        }
        if (Object.keys(sensorUpdates).length > 0) {
          onSensorsUpdate(sensorUpdates);
        }

        // Mark successful sync
        connectionManager.markSuccessfulSync();
      } catch (error) {
        logger.error('Sync failed:', error);
        // ConnectionManager handles reconnection automatically
      }
    };

    syncStates();
    pollIntervalRef.current = setInterval(syncStates, POLL_INTERVAL.lights);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isConnected, entityMapping, pendingLights, onLightsUpdate, onSensorsUpdate, updateLight]);

  return {
    forceSyncStates,
    markManualChange,
    attemptReconnect,
    isReconnecting,
    pendingLights,
  };
};
