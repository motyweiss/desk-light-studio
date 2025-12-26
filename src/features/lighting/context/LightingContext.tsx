import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { websocketService } from '@/api/homeAssistant';
import { lights as lightsAPI } from '@/api/homeAssistant';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { connectionManager } from '@/services/ConnectionManager';
import { useToast } from '@/hooks/use-toast';
import { usePolling } from '@/shared/hooks';
import { logger } from '@/shared/utils/logger';
import type { AnimationSource } from '@/constants/animations';

interface LightState {
  targetValue: number;
  displayValue: number;
  confirmedValue: number;
  isAnimating: boolean;
  isPending: boolean;
  source: AnimationSource;
}

interface LightingContextValue {
  lights: {
    spotlight: LightState;
    deskLamp: LightState;
    monitorLight: LightState;
  };
  setLightIntensity: (
    lightId: 'spotlight' | 'deskLamp' | 'monitorLight',
    value: number,
    source: AnimationSource
  ) => Promise<void>;
  isConnected: boolean;
  connectionType: 'websocket' | 'polling' | 'disconnected';
  reconnect: () => Promise<void>;
}

const LightingContext = createContext<LightingContextValue | null>(null);

export const useLighting = () => {
  const context = useContext(LightingContext);
  if (!context) {
    throw new Error('useLighting must be used within LightingProvider');
  }
  return context;
};

export const LightingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get config from global HAConnectionContext - Single Source of Truth
  const { config, entityMapping, isConnected: haConnected, connectionMode, markSuccessfulSync } = useHAConnection();
  const { toast } = useToast();
  
  const [connectionType, setConnectionType] = useState<'websocket' | 'polling' | 'disconnected'>('disconnected');
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [lights, setLights] = useState<LightingContextValue['lights']>({
    spotlight: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial' },
    deskLamp: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial' },
    monitorLight: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial' },
  });

  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const wsSubscriptionsRef = useRef<Array<() => void>>([]);

  // Map light IDs to entity IDs
  const getLightEntity = useCallback((lightId: 'spotlight' | 'deskLamp' | 'monitorLight') => {
    if (!entityMapping) return null;
    
    switch (lightId) {
      case 'spotlight': return entityMapping.spotlight;
      case 'deskLamp': return entityMapping.deskLamp;
      case 'monitorLight': return entityMapping.monitorLight;
    }
  }, [entityMapping]);

  // Fetch light states from API
  const fetchLightStates = useCallback(async () => {
    if (!entityMapping) return;

    logger.sync('Fetching light states...');
    const lightIds: Array<'spotlight' | 'deskLamp' | 'monitorLight'> = ['spotlight', 'deskLamp', 'monitorLight'];
    
    for (const lightId of lightIds) {
      const entityId = getLightEntity(lightId);
      if (!entityId) continue;

      try {
        let state;
        if (connectionMode === 'websocket') {
          state = await websocketService.getEntityState(entityId);
        } else {
          state = await lightsAPI.getState(entityId);
        }

        if (state) {
          const intensity = state.state === 'on'
            ? Math.round(((state.attributes?.brightness || 255) / 255) * 100)
            : 0;

          setLights(prev => {
            const light = prev[lightId];
            // Don't update if pending or same value
            if (light.isPending || light.confirmedValue === intensity) return prev;

            logger.light(lightId, `Synced: ${intensity}%`);

            return {
              ...prev,
              [lightId]: {
                targetValue: intensity,
                displayValue: intensity,
                confirmedValue: intensity,
                isAnimating: false,
                isPending: false,
                source: 'external',
              }
            };
          });
          
          // Mark successful sync in ConnectionManager
          markSuccessfulSync();
        }
      } catch (error) {
        logger.error(`Failed to fetch state for ${lightId}`, error);
      }
    }
  }, [entityMapping, getLightEntity, connectionMode, markSuccessfulSync]);

  // Polling function
  const pollLights = useCallback(async () => {
    if (!entityMapping) return;
    await fetchLightStates();
  }, [entityMapping, fetchLightStates]);

  // Setup polling - 1.5 second interval
  usePolling(pollLights, {
    interval: 1500,
    enabled: pollingEnabled,
    runOnFocus: true,
  });

  // Sync connection type with ConnectionManager
  useEffect(() => {
    if (!haConnected) {
      setConnectionType('disconnected');
      setPollingEnabled(false);
      return;
    }

    if (connectionMode === 'websocket') {
      setConnectionType('websocket');
      setPollingEnabled(false);
    } else if (connectionMode === 'polling') {
      setConnectionType('polling');
      setPollingEnabled(true);
    }
  }, [haConnected, connectionMode]);

  // Subscribe to WebSocket updates when in websocket mode
  useEffect(() => {
    if (!haConnected || !entityMapping || connectionMode !== 'websocket') {
      return;
    }

    logger.connection('Setting up WebSocket subscriptions for lights...');

    const lightIds: Array<'spotlight' | 'deskLamp' | 'monitorLight'> = ['spotlight', 'deskLamp', 'monitorLight'];
    
    lightIds.forEach((lightId) => {
      const entityId = getLightEntity(lightId);
      if (entityId) {
        const unsubscribe = websocketService.subscribe(entityId, (state: any) => {
          const newIntensity = state.state === 'on' 
            ? Math.round((state.attributes.brightness || 255) / 255 * 100)
            : 0;

          setLights(prev => {
            const light = prev[lightId];
            
            // Don't update if pending or same value
            if (light.isPending || light.confirmedValue === newIntensity) return prev;
            
            logger.light(lightId, `WebSocket: ${newIntensity}%`);
            
            return {
              ...prev,
              [lightId]: {
                ...light,
                targetValue: newIntensity,
                confirmedValue: newIntensity,
                source: 'external',
              }
            };
          });
          
          // Mark successful sync
          markSuccessfulSync();
        });
        
        wsSubscriptionsRef.current.push(unsubscribe);
      }
    });

    // Fetch initial states
    fetchLightStates();

    return () => {
      wsSubscriptionsRef.current.forEach(unsub => unsub());
      wsSubscriptionsRef.current = [];
    };
  }, [haConnected, entityMapping, connectionMode, getLightEntity, fetchLightStates, markSuccessfulSync]);

  // Set light intensity
  const setLightIntensity = useCallback(async (
    lightId: 'spotlight' | 'deskLamp' | 'monitorLight',
    value: number,
    source: AnimationSource
  ) => {
    const entityId = getLightEntity(lightId);
    if (!entityId) return;

    // Optimistic update
    setLights(prev => ({
      ...prev,
      [lightId]: {
        ...prev[lightId],
        targetValue: value,
        isPending: source === 'user',
        source,
      }
    }));

    if (source === 'user') {
      const existingTimer = debounceTimersRef.current.get(lightId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const currentValue = lights[lightId].targetValue;
      const delay = Math.abs(value - currentValue) > 50 ? 0 : 300;
      
      const timer = setTimeout(async () => {
        logger.light(lightId, `Setting to ${value}%`);
        
        try {
          if (value === 0) {
            await lightsAPI.turnOff(entityId);
          } else {
            await lightsAPI.setBrightness(entityId, value);
          }
          
          setTimeout(() => {
            setLights(prev => ({
              ...prev,
              [lightId]: {
                ...prev[lightId],
                confirmedValue: value,
                isPending: false,
              }
            }));
          }, 200);
        } catch (error) {
          logger.error(`Failed to set ${lightId}`, error);
          
          setLights(prev => ({
            ...prev,
            [lightId]: {
              ...prev[lightId],
              targetValue: prev[lightId].confirmedValue,
              isPending: false,
            }
          }));
          
          toast({
            title: 'Failed to update light',
            description: `Could not update ${lightId}`,
            variant: 'destructive',
          });
        }
      }, delay);

      debounceTimersRef.current.set(lightId, timer);
    }
  }, [getLightEntity, lights, toast]);

  // Reconnect function - delegates to ConnectionManager
  const reconnect = useCallback(async () => {
    if (!config) return;

    try {
      logger.connection('LightingContext: Reconnect requested');
      await connectionManager.reconnect();
      
      // Fetch fresh states after reconnect
      await fetchLightStates();
      
      toast({
        title: 'Reconnected',
        description: 'Successfully reconnected to Home Assistant',
      });
    } catch (error) {
      logger.error('Reconnection failed', error);
    }
  }, [config, fetchLightStates, toast]);

  const value: LightingContextValue = {
    lights,
    setLightIntensity,
    isConnected: connectionType !== 'disconnected',
    connectionType,
    reconnect,
  };

  return (
    <LightingContext.Provider value={value}>
      {children}
    </LightingContext.Provider>
  );
};
