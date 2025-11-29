import { createContext, useContext, ReactNode } from 'react';
import { useClimateSync } from '@/hooks/useClimateSync';
import { useHomeAssistantConfig } from '@/hooks/useHomeAssistantConfig';

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
  const { isConnected, entityMapping } = useHomeAssistantConfig();
  
  const climateState = useClimateSync({
    isConnected,
    entityMapping,
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
