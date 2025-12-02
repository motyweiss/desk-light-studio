import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { websocketService } from '@/api/homeAssistant';
import { haClient, lights as lightsAPI } from '@/api/homeAssistant';
import { useHomeAssistantConfig } from '@/hooks/useHomeAssistantConfig';
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
  const { config, entityMapping, isConnected: haConnected } = useHomeAssistantConfig();
  const { toast } = useToast();
  
  const [connectionType, setConnectionType] = useState<'websocket' | 'polling' | 'disconnected'>('disconnected');
  const [lights, setLights] = useState<LightingContextValue['lights']>({
    spotlight: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial' },
    deskLamp: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial' },
    monitorLight: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial' },
  });

  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pollingEnabledRef = useRef(false);

  // Map light IDs to entity IDs
  const getLightEntity = useCallback((lightId: 'spotlight' | 'deskLamp' | 'monitorLight') => {
    if (!entityMapping) return null;
    
    switch (lightId) {
      case 'spotlight': return entityMapping.spotlight;
      case 'deskLamp': return entityMapping.deskLamp;
      case 'monitorLight': return entityMapping.monitorLight;
    }
  }, [entityMapping]);

  // Fetch initial light states
  const fetchInitialStates = useCallback(async () => {
    if (!entityMapping) return;

    const lightIds: Array<'spotlight' | 'deskLamp' | 'monitorLight'> = ['spotlight', 'deskLamp', 'monitorLight'];
    
    for (const lightId of lightIds) {
      const entityId = getLightEntity(lightId);
      if (!entityId) continue;

      try {
        let state;
        if (connectionType === 'websocket') {
          state = await websocketService.getEntityState(entityId);
        } else {
          state = await lightsAPI.getState(entityId);
        }

        if (state) {
          const intensity = state.state === 'on'
            ? Math.round(((state.attributes?.brightness || 255) / 255) * 100)
            : 0;

          logger.light(lightId, `Initial state: ${intensity}%`);

          setLights(prev => ({
            ...prev,
            [lightId]: {
              targetValue: intensity,
              displayValue: intensity,
              confirmedValue: intensity,
              isAnimating: false,
              isPending: false,
              source: 'initial',
            }
          }));
        }
      } catch (error) {
        logger.error(`Failed to fetch initial state for ${lightId}`, error);
      }
    }
  }, [entityMapping, getLightEntity, connectionType]);

  // Polling function
  const pollLights = useCallback(async () => {
    if (!entityMapping) return;

    const lightIds: Array<'spotlight' | 'deskLamp' | 'monitorLight'> = ['spotlight', 'deskLamp', 'monitorLight'];
    
    for (const lightId of lightIds) {
      const entityId = getLightEntity(lightId);
      if (!entityId) continue;

      const light = lights[lightId];
      if (light.isPending) continue;

      try {
        const state = await lightsAPI.getState(entityId);
        if (state) {
          const intensity = state.state === 'on'
            ? Math.round(((state.attributes?.brightness || 255) / 255) * 100)
            : 0;

          if (light.confirmedValue !== intensity) {
            logger.light(lightId, `Polled change: ${intensity}%`);
            
            setLights(prev => ({
              ...prev,
              [lightId]: {
                ...prev[lightId],
                targetValue: intensity,
                confirmedValue: intensity,
                source: 'external',
              }
            }));
          }
        }
      } catch (error) {
        logger.error(`Polling failed for ${lightId}`, error);
      }
    }
  }, [entityMapping, lights, getLightEntity]);

  // Setup polling with shared hook
  usePolling(pollLights, {
    interval: 1000,
    enabled: pollingEnabledRef.current && connectionType === 'polling',
    runOnFocus: true,
  });

  // Initialize WebSocket connection
  useEffect(() => {
    if (!haConnected || !config || !entityMapping) {
      setConnectionType('disconnected');
      pollingEnabledRef.current = false;
      return;
    }

    // Configure API client
    haClient.setConfig(config);

    const connectWebSocket = async () => {
      try {
        logger.connection('Attempting WebSocket connection...');
        await websocketService.connect(config);
        
        setConnectionType('websocket');
        pollingEnabledRef.current = false;
        logger.connection('WebSocket connected - real-time sync active');

        // Subscribe to light entity changes
        const unsubscribers: (() => void)[] = [];

        const lightIds: Array<'spotlight' | 'deskLamp' | 'monitorLight'> = ['spotlight', 'deskLamp', 'monitorLight'];
        
        lightIds.forEach((lightId) => {
          const entityId = getLightEntity(lightId);
          if (entityId) {
            const unsubscribe = websocketService.subscribe(entityId, (state: any) => {
              const newIntensity = state.state === 'on' 
                ? Math.round((state.attributes.brightness || 255) / 255 * 100)
                : 0;

              logger.light(lightId, `WebSocket change: ${newIntensity}%`);

              setLights(prev => {
                const light = prev[lightId];
                
                if (!light.isPending && light.confirmedValue !== newIntensity) {
                  return {
                    ...prev,
                    [lightId]: {
                      ...light,
                      targetValue: newIntensity,
                      confirmedValue: newIntensity,
                      source: 'external',
                    }
                  };
                }
                
                return prev;
              });
            });
            
            unsubscribers.push(unsubscribe);
          }
        });

        await fetchInitialStates();

        return () => {
          unsubscribers.forEach(unsub => unsub());
        };
      } catch (error) {
        logger.warn('WebSocket connection failed, falling back to polling', error);
        setConnectionType('polling');
        pollingEnabledRef.current = true;
      }
    };

    connectWebSocket();

    return () => {
      if (connectionType === 'websocket') {
        websocketService.disconnect();
      }
      pollingEnabledRef.current = false;
    };
  }, [haConnected, config, entityMapping, getLightEntity, fetchInitialStates, connectionType]);

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

      const delay = Math.abs(value - lights[lightId].targetValue) > 50 ? 0 : 300;
      
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

  // Reconnect function
  const reconnect = useCallback(async () => {
    if (!config || !entityMapping) return;

    try {
      logger.connection('Manual reconnection attempt...');
      await websocketService.connect(config);
      setConnectionType('websocket');
      pollingEnabledRef.current = false;
      await fetchInitialStates();
      
      toast({
        title: 'Reconnected',
        description: 'Successfully reconnected to Home Assistant',
      });
    } catch (error) {
      logger.error('Reconnection failed', error);
      setConnectionType('polling');
      pollingEnabledRef.current = true;
    }
  }, [config, entityMapping, fetchInitialStates, toast]);

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
