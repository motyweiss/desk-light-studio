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
  lastUserChangeTime: number; // Timestamp of last user change - used to ignore stale external updates
  lastSentValue: number; // Last value sent to API - prevents duplicate calls
  lastSentTime: number; // Timestamp of last API call
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
    spotlight: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial', lastUserChangeTime: 0, lastSentValue: -1, lastSentTime: 0 },
    deskLamp: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial', lastUserChangeTime: 0, lastSentValue: -1, lastSentTime: 0 },
    monitorLight: { targetValue: 0, displayValue: 0, confirmedValue: 0, isAnimating: false, isPending: false, source: 'initial', lastUserChangeTime: 0, lastSentValue: -1, lastSentTime: 0 },
  });
  
  // Grace period to ignore stale external updates after user changes
  // Covers: animation (~750ms) + debounce (300ms) + API call (~500ms) + response + buffer
  const USER_CHANGE_GRACE_PERIOD = 3500; // 3.5 seconds - increased for safety

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

  // Fetch light states from API - uses batch fetch for efficiency
  const fetchLightStates = useCallback(async () => {
    if (!entityMapping) return;

    const lightIds: Array<'spotlight' | 'deskLamp' | 'monitorLight'> = ['spotlight', 'deskLamp', 'monitorLight'];
    
    // Collect all entity IDs that are configured
    const entityIds = lightIds
      .map(id => getLightEntity(id))
      .filter((id): id is string => !!id);

    if (entityIds.length === 0) return;

    try {
      // Batch fetch all light states at once
      const states = await lightsAPI.getMultipleStates(entityIds);

      for (const lightId of lightIds) {
        const entityId = getLightEntity(lightId);
        if (!entityId) continue;

        const state = states[entityId];
        if (state) {
          const intensity = state.state === 'on'
            ? Math.round(((state.attributes?.brightness || 255) / 255) * 100)
            : 0;

          setLights(prev => {
            const light = prev[lightId];
            const now = Date.now();
            
            // Ignore external updates during grace period after user change
            const isInGracePeriod = (now - light.lastUserChangeTime) < USER_CHANGE_GRACE_PERIOD;
            
            // Don't update if pending, in grace period, or same value (within 3% tolerance)
            if (light.isPending || isInGracePeriod) return prev;
            if (Math.abs(light.confirmedValue - intensity) < 3) return prev;

            return {
              ...prev,
              [lightId]: {
                ...light,
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
      }
    } catch (error) {
      logger.error('Failed to fetch light states', error);
    }
  }, [entityMapping, getLightEntity, markSuccessfulSync]);

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
            const now = Date.now();
            
            // Ignore external updates during grace period after user change
            const isInGracePeriod = (now - light.lastUserChangeTime) < USER_CHANGE_GRACE_PERIOD;
            
            // Don't update if pending or in grace period
            if (light.isPending || isInGracePeriod) return prev;
            
            // Don't update if same as current target (user intent preserved) - increased tolerance to 3%
            if (Math.abs(light.targetValue - newIntensity) < 3) return prev;
            
            // Don't update if same value (within 3% tolerance)
            if (Math.abs(light.confirmedValue - newIntensity) < 3) return prev;
            
            logger.light(lightId, `WebSocket: ${newIntensity}%`);
            
            return {
              ...prev,
              [lightId]: {
                ...light,
                targetValue: newIntensity,
                displayValue: newIntensity,
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
    if (!entityId) {
      logger.warn(`No entity ID for ${lightId}`);
      return;
    }

    // Check if lights API is ready before attempting to send commands
    if (source === 'user' && !lightsAPI.isReady()) {
      logger.error(`Cannot control ${lightId} - Home Assistant not configured`);
      toast({
        title: 'Not connected',
        description: 'Please configure Home Assistant connection in Settings',
        variant: 'destructive',
      });
      return;
    }

    // Optimistic update - mark timestamp for user changes
    const now = Date.now();
    setLights(prev => ({
      ...prev,
      [lightId]: {
        ...prev[lightId],
        targetValue: value,
        displayValue: value,
        isPending: source === 'user',
        source,
        lastUserChangeTime: source === 'user' ? now : prev[lightId].lastUserChangeTime,
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
        // Get current state at execution time (not closure time)
        setLights(prev => {
          const currentLight = prev[lightId];
          
          // Prevent duplicate API calls for the same value within 500ms
          const nowTime = Date.now();
          if (value === currentLight.lastSentValue && (nowTime - currentLight.lastSentTime) < 500) {
            logger.light(lightId, `Skipping duplicate call for ${value}%`);
            return {
              ...prev,
              [lightId]: { ...currentLight, isPending: false }
            };
          }
          
          // Update lastSentValue before API call
          return {
            ...prev,
            [lightId]: { ...currentLight, lastSentValue: value, lastSentTime: nowTime }
          };
        });
        
        logger.light(lightId, `Setting to ${value}% via ${entityId}`);
        
        try {
          if (value === 0) {
            await lightsAPI.turnOff(entityId);
          } else {
            await lightsAPI.setBrightness(entityId, value);
          }
          
          // Confirm value after successful API call
          setLights(prev => ({
            ...prev,
            [lightId]: {
              ...prev[lightId],
              confirmedValue: value,
              isPending: false,
            }
          }));
          markSuccessfulSync();
        } catch (error) {
          logger.error(`Failed to set ${lightId}`, error);
          
          // Rollback to confirmed value on error
          setLights(prev => ({
            ...prev,
            [lightId]: {
              ...prev[lightId],
              targetValue: prev[lightId].confirmedValue,
              displayValue: prev[lightId].confirmedValue,
              isPending: false,
            }
          }));
          
          toast({
            title: 'Failed to update light',
            description: error instanceof Error ? error.message : `Could not update ${lightId}`,
            variant: 'destructive',
          });
        }
      }, delay);

      debounceTimersRef.current.set(lightId, timer);
    }
  }, [getLightEntity, lights, toast, markSuccessfulSync]);

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
