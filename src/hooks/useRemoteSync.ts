import { useEffect, useCallback, useRef } from 'react';
import { homeAssistant } from '@/services/homeAssistant';

interface RemoteSyncConfig {
  entityId: string;
  onUpdate: (remoteIntensity: number) => void;
  pollInterval?: number;
  enabled: boolean;
}

export const useRemoteSync = (config: RemoteSyncConfig) => {
  const { entityId, onUpdate, pollInterval = 2000, enabled } = config;
  const pollTimerRef = useRef<NodeJS.Timeout>();

  const syncFromRemote = useCallback(async () => {
    if (!enabled || !entityId) return;

    try {
      const entity = await homeAssistant.getEntityState(entityId);
      if (!entity) return;

      let remoteIntensity = 0;
      if (entity.state === 'on' && entity.attributes?.brightness) {
        remoteIntensity = Math.round((entity.attributes.brightness / 255) * 100);
      }

      onUpdate(remoteIntensity);
    } catch (error) {
      console.error(`Failed to sync ${entityId}:`, error);
    }
  }, [entityId, enabled, onUpdate]);

  // Polling effect
  useEffect(() => {
    if (!enabled) return;

    syncFromRemote(); // Initial sync
    pollTimerRef.current = setInterval(syncFromRemote, pollInterval);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [enabled, syncFromRemote, pollInterval]);

  // Window focus sync
  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      syncFromRemote();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, syncFromRemote]);

  return { syncFromRemote };
};
