import { useState, useEffect, useCallback, useRef } from 'react';
import { homeAssistant, type MediaPlayerEntity } from '@/services/homeAssistant';
import type { MediaPlayerState } from '@/types/mediaPlayer';

interface UseMediaPlayerSyncConfig {
  entityId: string | undefined;
  enabled: boolean;
  pollInterval?: number;
}

export const useMediaPlayerSync = (config: UseMediaPlayerSyncConfig) => {
  const { entityId, enabled, pollInterval = 1500 } = config;
  const [playerState, setPlayerState] = useState<MediaPlayerState | null>(null);
  const [isLoading, setIsLoading] = useState(enabled && !!entityId);
  const pollTimerRef = useRef<NodeJS.Timeout>();
  const positionIntervalRef = useRef<NodeJS.Timeout>();
  const lastPositionUpdateRef = useRef<Date | null>(null);
  const localPositionRef = useRef<number>(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();

  const calculateCurrentPosition = useCallback((
    basePosition: number,
    updatedAt: Date | null,
    duration: number,
    isPlaying: boolean
  ): number => {
    if (!isPlaying || !updatedAt) return basePosition;
    const elapsed = (Date.now() - updatedAt.getTime()) / 1000;
    return Math.min(basePosition + elapsed, duration);
  }, []);

  const entityToState = useCallback((entity: MediaPlayerEntity): MediaPlayerState => {
    const attrs = entity.attributes;
    const isPlaying = entity.state === 'playing';
    const isPaused = entity.state === 'paused';
    const isIdle = entity.state === 'idle';
    const isOff = entity.state === 'off' || entity.state === 'standby';

    // Update position tracking
    if (attrs.media_position !== undefined) {
      localPositionRef.current = attrs.media_position;
      if (attrs.media_position_updated_at) {
        lastPositionUpdateRef.current = new Date(attrs.media_position_updated_at);
      }
    }

    const currentPosition = calculateCurrentPosition(
      attrs.media_position || 0,
      lastPositionUpdateRef.current,
      attrs.media_duration || 0,
      isPlaying
    );

    return {
      isPlaying,
      isPaused,
      isIdle,
      isOff,
      volume: attrs.volume_level ?? 0,
      isMuted: attrs.is_volume_muted ?? false,
      currentTrack: (attrs.media_title || attrs.media_artist) ? {
        title: attrs.media_title || 'Unknown Track',
        artist: attrs.media_artist || 'Unknown Artist',
        album: attrs.media_album_name || '',
        albumArt: attrs.entity_picture || null,
        duration: attrs.media_duration || 0,
        position: currentPosition,
      } : null,
      shuffle: attrs.shuffle ?? false,
      repeat: attrs.repeat || 'off',
      source: attrs.source || '',
      availableSources: attrs.source_list || [],
      groupedSpeakers: attrs.group_members || [],
      appName: attrs.app_name || null,
      isPending: false,
      isLoading: false,
      entityId: entity.entity_id,
    };
  }, [calculateCurrentPosition]);

  const syncFromRemote = useCallback(async () => {
    if (!enabled || !entityId) {
      console.log('useMediaPlayerSync: sync skipped', { enabled, entityId });
      return;
    }

    console.log('useMediaPlayerSync: syncing from HA...', entityId);

    try {
      const entity = await homeAssistant.getMediaPlayerState(entityId);
      
      // Clear loading timeout on successful response
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      if (!entity) {
        console.log('useMediaPlayerSync: no entity found - checking available media players...');
        // Get all available media players to help debug
        const availablePlayers = await homeAssistant.getMediaPlayers();
        console.log('📺 AVAILABLE MEDIA PLAYERS:');
        availablePlayers.forEach(p => {
          console.log(`  - ${p.entity_id}: ${p.attributes.friendly_name || 'No name'} (${p.state})`);
        });
        console.log('\n⚠️  To fix: Open Settings (⚙️ icon) → Entity Mapping → Select your Spotify player');
        setIsLoading(false);
        return;
      }

      console.log('useMediaPlayerSync: entity received', entity);
      const state = entityToState(entity);
      setPlayerState(state);
      setIsLoading(false);
    } catch (error) {
      console.error(`Failed to sync media player ${entityId}:`, error);
      setIsLoading(false);
      // Clear loading timeout on error
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }
  }, [entityId, enabled, entityToState]);

  // Polling effect
  useEffect(() => {
    if (!enabled || !entityId) {
      setIsLoading(false);
      setPlayerState(null);
      return;
    }

    // Set timeout for loading state - if no response after 5 seconds, give up
    loadingTimeoutRef.current = setTimeout(() => {
      console.log('useMediaPlayerSync: loading timeout - no media player found');
      setIsLoading(false);
      setPlayerState(null);
    }, 5000);

    syncFromRemote(); // Initial sync
    pollTimerRef.current = setInterval(syncFromRemote, pollInterval);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [enabled, syncFromRemote, pollInterval, entityId]);

  // Real-time position tracking for playing media
  useEffect(() => {
    if (!playerState?.isPlaying || !playerState.currentTrack) {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
      return;
    }

    // Update position every second while playing
    positionIntervalRef.current = setInterval(() => {
      setPlayerState(prev => {
        if (!prev || !prev.currentTrack || !prev.isPlaying) return prev;
        
        const newPosition = Math.min(
          localPositionRef.current + 1,
          prev.currentTrack.duration
        );
        localPositionRef.current = newPosition;

        return {
          ...prev,
          currentTrack: {
            ...prev.currentTrack,
            position: newPosition,
          },
        };
      });
    }, 1000);

    return () => {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    };
  }, [playerState?.isPlaying, playerState?.currentTrack]);

  // Window focus sync
  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      syncFromRemote();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, syncFromRemote]);

  return { 
    playerState, 
    isLoading, 
    syncFromRemote,
    setPlayerState 
  };
};
