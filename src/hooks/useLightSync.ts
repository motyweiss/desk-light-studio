import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { homeAssistant } from '@/services/homeAssistant';
import { useToast } from '@/hooks/use-toast';

interface LightState {
  intensity: number;
  pendingIntensity: number | null;
  lastRemoteIntensity: number;
  isPending: boolean;
  lastManualChange: number;
  hasError: boolean;
}

interface LightSyncConfig {
  entityId: string;
  initialIntensity?: number;
  debounceMs?: number;
  blockPollingMs?: number;
}

export const useLightSync = (config: LightSyncConfig) => {
  const { entityId, initialIntensity = 0, debounceMs = 300, blockPollingMs = 800 } = config;
  const { toast } = useToast();
  
  const [state, setState] = useState<LightState>({
    intensity: initialIntensity,
    pendingIntensity: null,
    lastRemoteIntensity: initialIntensity,
    isPending: false,
    lastManualChange: 0,
    hasError: false,
  });

  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const pendingCommandRef = useRef<{ intensity: number } | null>(null);

  // Update from remote (polling)
  const updateFromRemote = useCallback((remoteIntensity: number) => {
    const now = Date.now();
    
    // Skip update if:
    // 1. There's a pending command
    // 2. Recent manual change (within blockPollingMs)
    if (state.isPending || (now - state.lastManualChange < blockPollingMs)) {
      return;
    }

    // Only update if there's an actual difference
    if (state.intensity !== remoteIntensity) {
      setState(prev => ({
        ...prev,
        intensity: remoteIntensity,
        lastRemoteIntensity: remoteIntensity,
        hasError: false,
      }));
    }
  }, [state.isPending, state.lastManualChange, state.intensity, blockPollingMs]);

  // Rollback to last known state
  const rollback = useCallback((previousIntensity: number) => {
    setState(prev => ({
      ...prev,
      intensity: previousIntensity,
      pendingIntensity: null,
      isPending: false,
      hasError: true,
    }));
  }, []);

  // Send command with retry logic
  const sendCommand = useCallback(async (targetIntensity: number): Promise<boolean> => {
    try {
      await homeAssistant.setLightBrightness(entityId, targetIntensity);
      return true;
    } catch (error) {
      console.error(`Failed to set light ${entityId} to ${targetIntensity}%:`, error);
      return false;
    }
  }, [entityId]);

  // Immediate change (for toggle, keyboard shortcuts)
  const setIntensityImmediate = useCallback(async (newIntensity: number) => {
    const previousIntensity = state.intensity;

    // Optimistic update
    setState(prev => ({
      ...prev,
      intensity: newIntensity,
      pendingIntensity: newIntensity,
      isPending: true,
      lastManualChange: Date.now(),
      hasError: false,
    }));

    // Send to Home Assistant
    const success = await sendCommand(newIntensity);

    if (success) {
      setState(prev => ({
        ...prev,
        pendingIntensity: null,
        isPending: false,
        lastRemoteIntensity: newIntensity,
      }));
    } else {
      rollback(previousIntensity);
      toast({
        title: "Sync Failed",
        description: "Failed to update light. Click to retry.",
        variant: "destructive",
      });
    }
  }, [state.intensity, sendCommand, rollback, toast]);

  // Debounced change (for slider)
  const setIntensityDebounced = useCallback((newIntensity: number) => {
    // Immediate UI update
    setState(prev => ({
      ...prev,
      intensity: newIntensity,
      lastManualChange: Date.now(),
    }));

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Store pending command
    pendingCommandRef.current = { intensity: newIntensity };

    // Set new debounced timer
    debounceTimerRef.current = setTimeout(async () => {
      if (!pendingCommandRef.current) return;

      const targetIntensity = pendingCommandRef.current.intensity;
      pendingCommandRef.current = null;

      setState(prev => ({
        ...prev,
        pendingIntensity: targetIntensity,
        isPending: true,
      }));

      const success = await sendCommand(targetIntensity);

      if (success) {
        setState(prev => ({
          ...prev,
          pendingIntensity: null,
          isPending: false,
          lastRemoteIntensity: targetIntensity,
          hasError: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          pendingIntensity: null,
          isPending: false,
          hasError: true,
        }));
        toast({
          title: "Sync Failed",
          description: "Failed to update light intensity.",
          variant: "destructive",
        });
      }
    }, debounceMs);
  }, [debounceMs, sendCommand, toast]);

  // Retry failed command
  const retry = useCallback(() => {
    if (state.hasError) {
      setIntensityImmediate(state.intensity);
    }
  }, [state.hasError, state.intensity, setIntensityImmediate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    intensity: state.intensity,
    isPending: state.isPending,
    hasError: state.hasError,
    setIntensityImmediate,
    setIntensityDebounced,
    updateFromRemote,
    retry,
  };
};
