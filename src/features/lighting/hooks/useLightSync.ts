import { useState, useCallback, useRef, useEffect } from 'react';
import { usePolling } from '@/shared/hooks';
import { lights, haClient } from '@/api/homeAssistant';
import { logger } from '@/shared/utils/logger';
import type { AnimationSource } from '@/constants/animations';

export interface LightState {
  displayValue: number;
  targetValue: number;
  confirmedValue: number;
  isPending: boolean;
}

interface UseLightSyncConfig {
  entityId: string;
  enabled: boolean;
  pollingInterval?: number;
  onChange?: (value: number, source: AnimationSource) => void;
}

interface UseLightSyncReturn extends LightState {
  setValue: (value: number, source: AnimationSource) => Promise<void>;
  forceSync: () => Promise<void>;
}

/**
 * Unified light synchronization hook
 * Handles optimistic updates, debouncing, and polling
 */
export const useLightSync = (config: UseLightSyncConfig): UseLightSyncReturn => {
  const { entityId, enabled, pollingInterval = 1500, onChange } = config;

  const [lightState, setLightState] = useState<LightState>({
    displayValue: 0,
    targetValue: 0,
    confirmedValue: 0,
    isPending: false,
  });

  const lastManualChangeRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef(false);

  /**
   * Sync state from Home Assistant
   */
  const syncFromRemote = useCallback(async () => {
    if (!enabled || !entityId) return;

    // Skip sync if we have a pending update or recent manual change
    const timeSinceManualChange = Date.now() - lastManualChangeRef.current;
    if (pendingUpdateRef.current || timeSinceManualChange < 500) {
      return;
    }

    try {
      const entity = await lights.getState(entityId);
      
      if (entity) {
        const brightness = entity.state === 'on'
          ? Math.round(((entity.attributes.brightness || 255) / 255) * 100)
          : 0;

        setLightState(prev => {
          // Only update if value has significantly changed
          if (Math.abs(prev.confirmedValue - brightness) > 2) {
            logger.light(entityId, `Synced from HA: ${brightness}%`);
            return {
              displayValue: brightness,
              targetValue: brightness,
              confirmedValue: brightness,
              isPending: false,
            };
          }
          return prev;
        });
      }
    } catch (error) {
      logger.error(`Failed to sync light ${entityId}`, error);
    }
  }, [enabled, entityId]);

  /**
   * Commit value to Home Assistant
   */
  const commitValue = useCallback(async (value: number) => {
    if (!enabled || !entityId) return;

    pendingUpdateRef.current = true;

    try {
      if (value === 0) {
        await lights.turnOff(entityId);
      } else {
        await lights.setBrightness(entityId, value);
      }

      // Force sync after successful commit
      setTimeout(() => {
        pendingUpdateRef.current = false;
        syncFromRemote();
      }, 200);

      setLightState(prev => ({
        ...prev,
        confirmedValue: value,
        isPending: false,
      }));

      logger.light(entityId, `Committed value: ${value}%`);
    } catch (error) {
      logger.error(`Failed to commit light ${entityId}`, error);
      pendingUpdateRef.current = false;
      
      // Rollback on error
      setLightState(prev => ({
        ...prev,
        displayValue: prev.confirmedValue,
        targetValue: prev.confirmedValue,
        isPending: false,
      }));
    }
  }, [enabled, entityId, syncFromRemote]);

  /**
   * Set light value with optimistic update and debouncing
   */
  const setValue = useCallback(async (value: number, source: AnimationSource) => {
    lastManualChangeRef.current = Date.now();

    // Immediate optimistic update
    setLightState(prev => ({
      ...prev,
      displayValue: value,
      targetValue: value,
      isPending: true,
    }));

    // Trigger onChange callback
    onChange?.(value, source);

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the actual API call
    debounceTimerRef.current = setTimeout(() => {
      commitValue(value);
    }, source === 'user' ? 300 : 0);
  }, [commitValue, onChange]);

  /**
   * Force immediate sync from Home Assistant
   */
  const forceSync = useCallback(async () => {
    pendingUpdateRef.current = false;
    await syncFromRemote();
  }, [syncFromRemote]);

  // Setup polling
  usePolling(syncFromRemote, {
    interval: pollingInterval,
    enabled,
    runOnFocus: true,
  });

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    ...lightState,
    setValue,
    forceSync,
  };
};
