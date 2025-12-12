import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { websocketService } from '@/api/homeAssistant';
import { haClient, lights as lightsAPI } from '@/api/homeAssistant';
import { useHAConnection } from '@/contexts/HAConnectionContext';
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
  const { config, entityMapping, isConnected: haConnected } = useHAConnection();
  const { toast } = useToast();
  
  const [connectionType, setConnectionType] = useState<'websocket' | 'polling' | 'disconnected'>('disconnected');
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [lights, setLights] = useState<LightingContextValue['lights']>({
    spotlight: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial' },
    deskLamp: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial' },
    monitorLight: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial' },
  });

  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const wsCleanupRef = useRef<(() => void) | null>(null);
  const connectionTypeRef = useRef(connectionType);

  // Keep ref in sync with state
  useEffect(() => {
    connectionTypeRef.current = connectionType;
  }, [connectionType]);

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

    logger.connection('Fetching initial light states...');
    const lightIds: Array<'spotlight' | 'deskLamp' | 'monitorLight'> = ['spotlight', 'deskLamp', 'monitorLight'];
    
    for (const lightId of lightIds) {
      const entityId = getLightEntity(lightId);
      if (!entityId) continue;

      try {
        let state;
        if (connectionTypeRef.current === 'websocket') {
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
  }, [entityMapping, getLightEntity]);

  // Polling function - fetch all lights sequentially  
  const pollLights = useCallback(async () => {
    if (!entityMapping) return;

    const lightIds: Array<'spotlight' | 'deskLamp' | 'monitorLight'> = ['spotlight', 'deskLamp', 'monitorLight'];
    
    for (const lightId of lightIds) {
      const entityId = getLightEntity(lightId);
      if (!entityId) continue;

      try {
        const state = await lightsAPI.getState(entityId);
        if (state) {
          const intensity = state.state === 'on'
            ? Math.round(((state.attributes?.brightness || 255) / 255) * 100)
            : 0;

          setLights(prev => {
            const light = prev[lightId];
            if (light.isPending) return prev;
            
            if (light.confirmedValue !== intensity) {
              logger.light(lightId, `Polled change: ${intensity}%`);
              
              return {
                ...prev,
                [lightId]: {
                  ...light,
                  targetValue: intensity,
                  confirmedValue: intensity,
                  source: 'external',
                }
              };
            }
            return prev;
          });
        }
      } catch (error) {
        logger.error(`Polling failed for ${lightId}`, error);
      }
    }
  }, [entityMapping, getLightEntity]);

  // Setup polling - 1.5 second interval
  usePolling(pollLights, {
    interval: 1500,
    enabled: pollingEnabled,
    runOnFocus: true,
  });

  // Initialize connection when HA is connected
  useEffect(() => {
    if (!haConnected || !config || !entityMapping) {
      setConnectionType('disconnected');
      setPollingEnabled(false);
      return;
    }

    logger.connection('HA connected, initializing lighting...');

    let isMounted = true;

    const connectWebSocket = async () => {
      try {
        logger.connection('Attempting WebSocket connection...');
        await websocketService.connect(config);
        
        if (!isMounted) return;
        
        setConnectionType('websocket');
        setPollingEnabled(false);
        connectionTypeRef.current = 'websocket';
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

        // Store cleanup function
        wsCleanupRef.current = () => {
          unsubscribers.forEach(unsub => unsub());
          websocketService.disconnect();
        };

        // Fetch initial states
        await fetchInitialStates();

      } catch (error) {
        if (!isMounted) return;
        
        logger.warn('WebSocket connection failed, falling back to polling', error);
        setConnectionType('polling');
        connectionTypeRef.current = 'polling';
        setPollingEnabled(true);
        
        fetchInitialStates();
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (wsCleanupRef.current) {
        wsCleanupRef.current();
        wsCleanupRef.current = null;
      }
      setPollingEnabled(false);
    };
  }, [haConnected, config, entityMapping, getLightEntity, fetchInitialStates]);

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

  // Reconnect function
  const reconnect = useCallback(async () => {
    if (!config || !entityMapping) return;

    try {
      logger.connection('Manual reconnection attempt...');
      await websocketService.connect(config);
      setConnectionType('websocket');
      connectionTypeRef.current = 'websocket';
      setPollingEnabled(false);
      await fetchInitialStates();
      
      toast({
        title: 'Reconnected',
        description: 'Successfully reconnected to Home Assistant',
      });
    } catch (error) {
      logger.error('Reconnection failed', error);
      setConnectionType('polling');
      connectionTypeRef.current = 'polling';
      setPollingEnabled(true);
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
