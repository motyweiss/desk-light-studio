import { useEffect, useCallback, useRef, useState } from 'react';
import { homeAssistant } from '@/services/homeAssistant';
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
  const reconnectAttemptRef = useRef(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  // Update parent reconnecting state
  useEffect(() => {
    onReconnectingChange(isReconnecting);
  }, [isReconnecting, onReconnectingChange]);

  // Helper to update a single light
  const updateLight = useCallback((
    entityId: string,
    lightId: string,
    currentIntensity: number,
    brightness: number | undefined,
    state: string
  ): number | null => {
    // Skip if light is pending HA confirmation
    if (pendingLights.has(lightId)) {
      console.log(`🚫 ${lightId}: skipped (pending HA confirmation)`);
      return null;
    }

    // Only skip update if manual change happened recently
    const timeSinceManualChange = Date.now() - lastManualChangeRef.current;
    if (timeSinceManualChange < BLOCKING_WINDOW.manualChange) {
      logger.sync(`Update blocked: ${lightId} (manual change ${timeSinceManualChange}ms ago)`);
      return null;
    }

    const newIntensity = state === 'on' ? Math.round((brightness || 255) / 255 * 100) : 0;

    if (currentIntensity !== newIntensity) {
      console.log(`💡 ${lightId} synced: ${currentIntensity}% → ${newIntensity}% (remote state: ${state})`);
      return newIntensity;
    }

    return null;
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

    console.log('⚡ Force sync triggered');

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
        console.log(`💡 Spotlight force synced: ${newIntensity}%`);
      }

      if (entityMapping.deskLamp && states.has(entityMapping.deskLamp)) {
        const state = states.get(entityMapping.deskLamp)!;
        const newIntensity = state.state === 'on'
          ? Math.round((state.brightness || 255) / 255 * 100)
          : 0;
        lightUpdates.deskLamp = newIntensity;
        console.log(`💡 Desk Lamp force synced: ${newIntensity}%`);
      }

      if (entityMapping.monitorLight && states.has(entityMapping.monitorLight)) {
        const state = states.get(entityMapping.monitorLight)!;
        const newIntensity = state.state === 'on'
          ? Math.round((state.brightness || 255) / 255 * 100)
          : 0;
        lightUpdates.monitorLight = newIntensity;
        console.log(`💡 Monitor Light force synced: ${newIntensity}%`);
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
    } catch (error) {
      console.error('❌ Force sync failed:', error);
      if (!isReconnecting) {
        setIsReconnecting(true);
      }
    }
  }, [isConnected, entityMapping, isReconnecting, onLightsUpdate, onSensorsUpdate]);

  // Track last manual change timestamp
  const markManualChange = useCallback(() => {
    lastManualChangeRef.current = Date.now();
  }, []);

  // Manual reconnect attempt
  const attemptReconnect = useCallback(async () => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    homeAssistant.resetRetryCount();
    
    try {
      const result = await homeAssistant.testConnection();
      if (result.success) {
        setIsReconnecting(false);
        await forceSyncStates();
        toast({ 
          title: 'Connected', 
          description: 'Home Assistant reconnected successfully' 
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setIsReconnecting(false);
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

    console.log('🔄 Starting Home Assistant sync polling');
    console.log('📡 Light entities:', lightEntityIds);
    console.log('🌡️ Sensor entities:', sensorEntityIds);

    const syncStates = async () => {
      const syncStartTime = Date.now();
      try {
        const states = await homeAssistant.getAllEntityStates(allEntityIds);
        const fetchDuration = Date.now() - syncStartTime;

        if (fetchDuration > 1000) {
          logger.warn(`Slow sync: ${fetchDuration}ms (threshold: 1000ms)`);
        }

        // Connection successful - reset reconnection state
        if (isReconnecting) {
          logger.connection('Connection restored!');
          setIsReconnecting(false);
          reconnectAttemptRef.current = 0;
          toast({
            title: 'Reconnected',
            description: 'Successfully reconnected to Home Assistant',
          });
        }

        const lightUpdates: Partial<LightStates> = {};
        const sensorUpdates: Partial<SensorStates> = {};

        // Update lights - using helper function
        if (entityMapping.spotlight && states.has(entityMapping.spotlight)) {
          const state = states.get(entityMapping.spotlight)!;
          const newIntensity = updateLight(
            entityMapping.spotlight,
            'spotlight',
            0, // We don't have current value here, will be handled by parent
            state.brightness,
            state.state
          );
          if (newIntensity !== null) {
            lightUpdates.spotlight = newIntensity;
          }
        }

        if (entityMapping.deskLamp && states.has(entityMapping.deskLamp)) {
          const state = states.get(entityMapping.deskLamp)!;
          const newIntensity = updateLight(
            entityMapping.deskLamp,
            'deskLamp',
            0,
            state.brightness,
            state.state
          );
          if (newIntensity !== null) {
            lightUpdates.deskLamp = newIntensity;
          }
        }

        if (entityMapping.monitorLight && states.has(entityMapping.monitorLight)) {
          const state = states.get(entityMapping.monitorLight)!;
          const newIntensity = updateLight(
            entityMapping.monitorLight,
            'monitorLight',
            0,
            state.brightness,
            state.state
          );
          if (newIntensity !== null) {
            lightUpdates.monitorLight = newIntensity;
          }
        }

        // Update sensors (unchanged logic, just condensed)
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
      } catch (error) {
        console.error('❌ Failed to sync with Home Assistant:', error);

        // Mark as reconnecting if not already
        if (!isReconnecting) {
          setIsReconnecting(true);
          toast({
            title: 'Connection Lost',
            description: 'Attempting to reconnect to Home Assistant...',
            variant: 'destructive',
          });
        }

        reconnectAttemptRef.current += 1;
        const retryCount = homeAssistant.getRetryCount();

        if (reconnectAttemptRef.current % 5 === 0) {
          console.warn(`🔄 Reconnection attempt ${reconnectAttemptRef.current} (retry count: ${retryCount})`);
        }
      }
    };

    console.log('🚀 Starting initial sync...');
    syncStates();

    // Poll every 1000ms (reduced from 500ms)
    pollIntervalRef.current = setInterval(syncStates, POLL_INTERVAL.lights);

    return () => {
      console.log('🛑 Stopping Home Assistant sync polling');
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isConnected, entityMapping, isReconnecting, pendingLights, toast, onLightsUpdate, onSensorsUpdate, updateLight]);

  return {
    forceSyncStates,
    markManualChange,
    attemptReconnect,
    isReconnecting,
    pendingLights,
  };
};
