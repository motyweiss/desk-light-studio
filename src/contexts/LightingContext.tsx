import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { websocketService } from '@/services/homeAssistantWebSocket';
import { homeAssistant } from '@/services/homeAssistant';
import { useHomeAssistantConfig } from '@/hooks/useHomeAssistantConfig';
import { useToast } from '@/hooks/use-toast';

type AnimationSource = 'user' | 'external' | 'initial';

interface LightState {
  targetValue: number;      // What the user wants
  displayValue: number;     // What the UI shows (animated)
  confirmedValue: number;   // What HA confirmed
  isAnimating: boolean;     // Whether currently animating
  isPending: boolean;       // Whether waiting for HA confirmation
  source: AnimationSource;  // Source of last change
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

  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Map light IDs to entity IDs
  const getLightEntity = useCallback((lightId: 'spotlight' | 'deskLamp' | 'monitorLight') => {
    if (!entityMapping) return null;
    
    switch (lightId) {
      case 'spotlight': return entityMapping.spotlight;
      case 'deskLamp': return entityMapping.deskLamp;
      case 'monitorLight': return entityMapping.monitorLight;
    }
  }, [entityMapping]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!haConnected || !config || !entityMapping) {
      setConnectionType('disconnected');
      return;
    }

    const connectWebSocket = async () => {
      try {
        console.log('🔌 Attempting WebSocket connection...');
        await websocketService.connect(config.baseUrl, config.accessToken);
        
        setConnectionType('websocket');
        console.log('✅ WebSocket connected - real-time sync active');

        // Subscribe to light entity changes
        const unsubscribers: (() => void)[] = [];

        const lightIds: Array<'spotlight' | 'deskLamp' | 'monitorLight'> = ['spotlight', 'deskLamp', 'monitorLight'];
        
        lightIds.forEach((lightId) => {
          const entityId = getLightEntity(lightId);
          if (entityId) {
            const unsubscribe = websocketService.subscribe(entityId, (state: any) => {
              // External change detected via WebSocket (real-time!)
              const newIntensity = state.state === 'on' 
                ? Math.round((state.attributes.brightness || 255) / 255 * 100)
                : 0;

              console.log(`🔔 WebSocket: ${lightId} changed externally → ${newIntensity}%`);

              setLights(prev => {
                const light = prev[lightId];
                
                // Only update if not pending and different from confirmed
                if (!light.isPending && light.confirmedValue !== newIntensity) {
                  return {
                    ...prev,
                    [lightId]: {
                      ...light,
                      targetValue: newIntensity,
                      confirmedValue: newIntensity,
                      source: 'external' as AnimationSource,
                    }
                  };
                }
                
                return prev;
              });
            });
            
            unsubscribers.push(unsubscribe);
          }
        });

        // Fetch initial states
        await fetchInitialStates();

        return () => {
          unsubscribers.forEach(unsub => unsub());
        };
      } catch (error) {
        console.warn('⚠️  WebSocket connection failed, falling back to polling:', error);
        setConnectionType('polling');
        startPolling();
      }
    };

    connectWebSocket();

    return () => {
      if (connectionType === 'websocket') {
        websocketService.disconnect();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [haConnected, config, entityMapping, getLightEntity]);

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
          state = await homeAssistant.getEntityState(entityId);
        }

        if (state) {
          const intensity = state.state === 'on'
            ? Math.round(((state.attributes?.brightness || 255) / 255) * 100)
            : 0;

          console.log(`💡 Initial ${lightId}: ${intensity}%`);

          setLights(prev => ({
            ...prev,
            [lightId]: {
              targetValue: intensity,
              displayValue: intensity,
              confirmedValue: intensity,
              isAnimating: false,
              isPending: false,
              source: 'initial' as AnimationSource,
            }
          }));
        }
      } catch (error) {
        console.error(`Failed to fetch initial state for ${lightId}:`, error);
      }
    }
  }, [entityMapping, getLightEntity, connectionType]);

  // Polling fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log('🔄 Starting polling fallback (1000ms interval)');

    const poll = async () => {
      if (!entityMapping) return;

      const lightIds: Array<'spotlight' | 'deskLamp' | 'monitorLight'> = ['spotlight', 'deskLamp', 'monitorLight'];
      
      for (const lightId of lightIds) {
        const entityId = getLightEntity(lightId);
        if (!entityId) continue;

        const light = lights[lightId];
        if (light.isPending) continue; // Skip if pending

        try {
          const state = await homeAssistant.getEntityState(entityId);
          if (state) {
            const intensity = state.state === 'on'
              ? Math.round(((state.attributes?.brightness || 255) / 255) * 100)
              : 0;

            if (light.confirmedValue !== intensity) {
              console.log(`🔄 Poll: ${lightId} changed → ${intensity}%`);
              
              setLights(prev => ({
                ...prev,
                [lightId]: {
                  ...prev[lightId],
                  targetValue: intensity,
                  confirmedValue: intensity,
                  source: 'external' as AnimationSource,
                }
              }));
            }
          }
        } catch (error) {
          console.error(`Polling failed for ${lightId}:`, error);
        }
      }
    };

    poll(); // Initial poll
    pollingIntervalRef.current = setInterval(poll, 1000);
  }, [entityMapping, lights, getLightEntity]);

  // Set light intensity (user or external)
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
      // Clear existing debounce timer
      const existingTimer = debounceTimersRef.current.get(lightId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Debounce API call for slider adjustments
      const delay = Math.abs(value - lights[lightId].targetValue) > 50 ? 0 : 300;
      
      const timer = setTimeout(async () => {
        console.log(`📤 Sending to HA: ${lightId} → ${value}%`);
        
        try {
          await homeAssistant.setLightBrightness(entityId, value);
          
          // Confirm after short delay
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
          console.error(`❌ Failed to set ${lightId}:`, error);
          
          // Rollback on error
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
      console.log('🔄 Manual reconnection attempt...');
      await websocketService.connect(config.baseUrl, config.accessToken);
      setConnectionType('websocket');
      await fetchInitialStates();
      
      toast({
        title: 'Reconnected',
        description: 'Successfully reconnected to Home Assistant',
      });
    } catch (error) {
      console.error('Reconnection failed:', error);
      setConnectionType('polling');
      startPolling();
    }
  }, [config, entityMapping, fetchInitialStates, startPolling, toast]);

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
