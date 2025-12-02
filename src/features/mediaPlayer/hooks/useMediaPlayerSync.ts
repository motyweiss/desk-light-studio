import { useState, useCallback, useRef, useEffect } from 'react';
import { usePolling } from '@/shared/hooks';
import { mediaPlayer } from '@/api/homeAssistant';
import { logger } from '@/shared/utils/logger';
import type { MediaPlayerState, PlaybackTarget } from '@/types/mediaPlayer';
import type { HAMediaPlayerEntity } from '@/api/homeAssistant/types';
import { PREDEFINED_GROUPS, SPEAKER_ENTITY_MAP } from '@/config/speakerGroups';

interface UseMediaPlayerSyncConfig {
  entityId: string | undefined;
  enabled: boolean;
  pollInterval?: number;
}

interface UseMediaPlayerSyncReturn {
  playerState: MediaPlayerState | null;
  isLoading: boolean;
  syncFromRemote: () => Promise<void>;
  setPlayerState: React.Dispatch<React.SetStateAction<MediaPlayerState | null>>;
  availableSpeakers: HAMediaPlayerEntity[];
  detectActiveTarget: (state: MediaPlayerState) => PlaybackTarget | null;
}

/**
 * Unified media player synchronization hook
 * Handles polling, state management, and playback target detection
 */
export const useMediaPlayerSync = (config: UseMediaPlayerSyncConfig): UseMediaPlayerSyncReturn => {
  const { entityId, enabled, pollInterval = 2000 } = config;

  const [playerState, setPlayerState] = useState<MediaPlayerState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableSpeakers, setAvailableSpeakers] = useState<HAMediaPlayerEntity[]>([]);

  const lastPositionUpdateRef = useRef<number>(0);
  const localPositionRef = useRef<number>(0);
  const isPlayingRef = useRef(false);

  /**
   * Convert HA entity to MediaPlayerState
   */
  const entityToState = useCallback((
    entity: HAMediaPlayerEntity,
    forcePositionUpdate: boolean = false
  ): MediaPlayerState => {
    const state = entity.state;
    const attrs = entity.attributes;

    const isPlaying = state === 'playing';
    const isPaused = state === 'paused';
    const isIdle = state === 'idle';
    const isOff = state === 'off';

    // Calculate position
    let position = localPositionRef.current;
    const remotePosition = attrs.media_position || 0;
    const positionUpdatedAt = attrs.media_position_updated_at
      ? new Date(attrs.media_position_updated_at).getTime()
      : Date.now();

    if (forcePositionUpdate || Math.abs(remotePosition - position) > 3) {
      const elapsed = (Date.now() - positionUpdatedAt) / 1000;
      position = isPlaying ? remotePosition + elapsed : remotePosition;
      localPositionRef.current = position;
      lastPositionUpdateRef.current = Date.now();
    }

    return {
      isPlaying,
      isPaused,
      isIdle,
      isOff,
      volume: Math.round((attrs.volume_level || 0) * 100),
      isMuted: attrs.is_volume_muted || false,
      currentTrack: {
        title: attrs.media_title || 'Unknown',
        artist: attrs.media_artist || 'Unknown Artist',
        album: attrs.media_album_name || '',
        albumArt: attrs.entity_picture || null,
        duration: attrs.media_duration || 0,
        position,
      },
      shuffle: attrs.shuffle || false,
      repeat: (attrs.repeat || 'off') as 'off' | 'all' | 'one',
      source: attrs.source || '',
      availableSources: attrs.source_list || [],
      groupedSpeakers: attrs.group_members || [],
      appName: attrs.app_name || 'Spotify',
      isPending: false,
      isLoading: false,
      entityId: entity.entity_id,
      isTrackLoading: false,
      isTrackTransitioning: false,
      wasExternallyPaused: false,
      queueEnded: false,
      errorState: null,
    };
  }, []);

  /**
   * Sync state from Home Assistant
   */
  const syncFromRemote = useCallback(async () => {
    if (!enabled || !entityId) {
      setIsLoading(false);
      return;
    }

    try {
      const entity = await mediaPlayer.getState(entityId);

      if (entity) {
        const trackChanged = 
          playerState?.currentTrack?.title !== entity.attributes.media_title ||
          entity.state !== (playerState?.isPlaying ? 'playing' : playerState?.isPaused ? 'paused' : 'off');

        const newState = entityToState(entity, trackChanged);
        setPlayerState(newState);
        isPlayingRef.current = newState.isPlaying;
      }

      setIsLoading(false);
    } catch (error) {
      logger.error('Failed to sync media player', error);
      setIsLoading(false);
    }
  }, [enabled, entityId, playerState, entityToState]);

  /**
   * Detect active playback target
   */
  const detectActiveTarget = useCallback((state: MediaPlayerState): PlaybackTarget | null => {
    if (!state.source) return null;

    // Check if it's a speaker group
    const matchingGroup = PREDEFINED_GROUPS.find(group => {
      const groupSpeakers = new Set(group.entityIds);
      const activeSpeakers = new Set(state.groupedSpeakers);
      return groupSpeakers.size === activeSpeakers.size &&
        [...groupSpeakers].every(id => activeSpeakers.has(id));
    });

    if (matchingGroup) {
      return {
        type: 'group',
        name: matchingGroup.name,
        entityIds: matchingGroup.entityIds,
        groupId: matchingGroup.id,
      };
    }

    // Check if it's a specific speaker
    const speakerEntry = Object.entries(SPEAKER_ENTITY_MAP).find(
      ([_, entityId]) => state.groupedSpeakers.includes(entityId)
    );

    if (speakerEntry) {
      return {
        type: 'speaker',
        name: speakerEntry[0],
        entityIds: [speakerEntry[1]],
      };
    }

    // Fallback to Spotify Connect source
    return {
      type: 'spotify',
      name: state.source,
      entityIds: [],
    };
  }, []);

  /**
   * Load available speakers (cached)
   */
  const loadAvailableSpeakers = useCallback(async () => {
    // Only load if not already loaded
    if (availableSpeakers.length > 0) return;
    
    try {
      const speakers = await mediaPlayer.getAvailablePlayers();
      const sonosSpeakers = speakers.filter(speaker => 
        speaker.entity_id.includes('sonos') &&
        speaker.state !== 'unavailable' &&
        !speaker.entity_id.includes('tv')
      );
      setAvailableSpeakers(sonosSpeakers);
      logger.media(`Loaded ${sonosSpeakers.length} available speakers`);
    } catch (error) {
      logger.error('Failed to load available speakers', error);
    }
  }, [availableSpeakers.length]);

  // Real-time position tracking
  useEffect(() => {
    if (!playerState?.isPlaying) return;

    const interval = setInterval(() => {
      setPlayerState(prev => {
        if (!prev?.isPlaying || !prev.currentTrack) return prev;

        const elapsed = (Date.now() - lastPositionUpdateRef.current) / 1000;
        const newPosition = Math.min(
          localPositionRef.current + elapsed,
          prev.currentTrack.duration
        );

        localPositionRef.current = newPosition;
        lastPositionUpdateRef.current = Date.now();

        return {
          ...prev,
          currentTrack: {
            ...prev.currentTrack,
            position: newPosition,
          },
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [playerState?.isPlaying]);

  // Setup polling
  usePolling(syncFromRemote, {
    interval: pollInterval,
    enabled,
    runOnFocus: true,
  });

  // Initial load
  useEffect(() => {
    if (enabled && entityId) {
      syncFromRemote();
      loadAvailableSpeakers();

      // Timeout for initial load
      const timeout = setTimeout(() => {
        if (isLoading) {
          logger.warn('Media player initial load timeout');
          setIsLoading(false);
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [enabled, entityId, syncFromRemote, loadAvailableSpeakers, isLoading]);

  return {
    playerState,
    isLoading,
    syncFromRemote,
    setPlayerState,
    availableSpeakers,
    detectActiveTarget,
  };
};
