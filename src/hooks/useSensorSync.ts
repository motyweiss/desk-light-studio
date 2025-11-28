import { useState, useEffect, useCallback } from 'react';
import { homeAssistant } from '@/services/homeAssistant';

interface SensorState {
  temperature: number;
  humidity: number;
  airQuality: number;
  iphoneBattery: number;
  iphoneCharging: boolean;
  airpodsBattery: number;
}

export const useSensorSync = (
  entityMapping: Record<string, string>,
  pollInterval: number = 3000
) => {
  const [sensors, setSensors] = useState<SensorState>({
    temperature: 24,
    humidity: 60,
    airQuality: 35,
    iphoneBattery: 70,
    iphoneCharging: false,
    airpodsBattery: 85,
  });

  const syncSensors = useCallback(async () => {
    try {
      const [tempState, humidityState, aqState, iphoneBatteryState, iphoneBatteryStatus, airpodsBatteryState] = 
        await Promise.all([
          homeAssistant.getEntityState(entityMapping.temperature || ''),
          homeAssistant.getEntityState(entityMapping.humidity || ''),
          homeAssistant.getEntityState(entityMapping.airQuality || ''),
          homeAssistant.getEntityState(entityMapping.iphoneBattery || ''),
          homeAssistant.getEntityState(entityMapping.iphoneBatteryState || ''),
          homeAssistant.getEntityState(entityMapping.airpodsBattery || ''),
        ]);

      setSensors({
        temperature: parseFloat(tempState?.state || '24'),
        humidity: parseFloat(humidityState?.state || '60'),
        airQuality: parseFloat(aqState?.state || '35'),
        iphoneBattery: parseFloat(iphoneBatteryState?.state || '70'),
        iphoneCharging: iphoneBatteryStatus?.state?.toLowerCase().includes('charging') && 
                       !iphoneBatteryStatus?.state?.toLowerCase().includes('not'),
        airpodsBattery: parseFloat(airpodsBatteryState?.state || '85'),
      });
    } catch (error) {
      console.error('Failed to sync sensors:', error);
    }
  }, [entityMapping]);

  useEffect(() => {
    syncSensors();
    const interval = setInterval(syncSensors, pollInterval);
    return () => clearInterval(interval);
  }, [syncSensors, pollInterval]);

  return sensors;
};
