import React, { createContext, useContext, ReactNode } from 'react';
import { useClimateSync } from '@/features/climate/hooks/useClimateSync';
import { useHAConnection } from '@/contexts/HAConnectionContext';

interface ClimateState {
  temperature: number;
  humidity: number;
  airQuality: number;
  iphoneBatteryLevel: number;
  iphoneBatteryCharging: boolean;
  airpodsMaxBatteryLevel: number;
  airpodsMaxBatteryCharging: boolean;
  isLoaded: boolean;
}

interface ClimateContextValue extends ClimateState {
  // Future: add methods for manual refresh, etc.
}

const ClimateContext = createContext<ClimateContextValue | undefined>(undefined);

export const ClimateProvider = ({ children }: { children: ReactNode }) => {
  // Get config from global HAConnectionContext - Single Source of Truth
  const { isConnected, entityMapping } = useHAConnection();
  
  const climateState = useClimateSync({
    isConnected,
    entityMapping: {
      temperatureSensor: entityMapping?.temperatureSensor,
      humiditySensor: entityMapping?.humiditySensor,
      airQualitySensor: entityMapping?.airQualitySensor,
      iphoneBattery: entityMapping?.iphoneBatteryLevel,
      iphoneBatteryState: entityMapping?.iphoneBatteryState,
      airpodsMaxBattery: entityMapping?.airpodsMaxBatteryLevel,
      airpodsMaxBatteryState: entityMapping?.airpodsMaxBatteryState,
    },
  });

  return (
    <ClimateContext.Provider value={climateState}>
      {children}
    </ClimateContext.Provider>
  );
};

export const useClimate = () => {
  const context = useContext(ClimateContext);
  if (context === undefined) {
    throw new Error('useClimate must be used within a ClimateProvider');
  }
  return context;
};