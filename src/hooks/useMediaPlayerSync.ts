import { useState, useEffect, useCallback, useRef } from 'react';
import { homeAssistant, type MediaPlayerEntity } from '@/services/homeAssistant';
import type { MediaPlayerState, PlaybackTarget } from '@/types/mediaPlayer';
import { POLL_INTERVAL } from '@/constants/animations';
import { PREDEFINED_GROUPS } from '@/config/speakerGroups';

interface UseMediaPlayerSyncConfig {
  entityId: string | undefined;
  enabled: boolean;
  pollInterval?: number;
}

export const useMediaPlayerSync = (config: UseMediaPlayerSyncConfig) => {
  const { entityId, enabled, pollInterval = POLL_INTERVAL.mediaPlayer } = config;
  const [playerState, setPlayerState] = useState<MediaPlayerState | null>(null);
  const [isLoading, setIsLoading] = useState(enabled && !!entityId);
  const [availableSpeakers, setAvailableSpeakers] = useState<MediaPlayerEntity[]>([]);
  const pollTimerRef = useRef<NodeJS.Timeout>();
  const positionIntervalRef = useRef<NodeJS.Timeout>();
  const lastPositionUpdateRef = useRef<Date | null>(null);
  const localPositionRef = useRef<number>(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTrackIdRef = useRef<string>('');
  const isPlayingRef = useRef<boolean>(false);
  const lastSyncedPositionRef = useRef<number>(0);

  const entityToState = useCallback((entity: MediaPlayerEntity, forcePositionUpdate: boolean = false): MediaPlayerState => {
    const attrs = entity.attributes;
    const isPlaying = entity.state === 'playing';
    const isPaused = entity.state === 'paused';
    const isIdle = entity.state === 'idle';
    const isOff = entity.state === 'off' || entity.state === 'standby';

    // Create track ID for change detection
    const currentTrackId = `${attrs.media_title}-${attrs.media_artist}-${attrs.media_album_name}`;
    const trackChanged = currentTrackId !== lastTrackIdRef.current && currentTrackId !== '--';
    const stateChanged = isPlaying !== isPlayingRef.current;

    // Edge case detection
    const isTrackLoading = !attrs.media_title || attrs.media_duration === 0;
    const wasExternallyPaused = isPaused && isPlayingRef.current; // Was playing, now paused externally
    const queueEnded = isIdle && lastSyncedPositionRef.current > 0;

    // Detect position jump (repeat or external seek)
    const positionJump = attrs.media_position !== undefined 
      ? Math.abs(attrs.media_position - localPositionRef.current) 
      : 0;
    const isRepeatJump = positionJump > 10 && attrs.media_position < 5; // Jump from end to start

    // Only update position from HA if:
    // 1. Track changed
    // 2. Playback state changed (play/pause)
    // 3. Force update requested (user seek)
    // 4. Position difference is significant (>3 seconds - indicates external seek/skip)
    // 5. Repeat jump detected
    let shouldUpdatePosition = forcePositionUpdate || trackChanged || stateChanged || isRepeatJump;
    
    if (!shouldUpdatePosition && attrs.media_position !== undefined) {
      const positionDiff = Math.abs(attrs.media_position - localPositionRef.current);
      shouldUpdatePosition = positionDiff > 3; // More than 3 seconds difference
    }

    if (shouldUpdatePosition && attrs.media_position !== undefined) {
      localPositionRef.current = attrs.media_position;
      lastSyncedPositionRef.current = attrs.media_position;
      if (attrs.media_position_updated_at) {
        lastPositionUpdateRef.current = new Date(attrs.media_position_updated_at);
      }
    }

    // Update refs for next comparison
    lastTrackIdRef.current = currentTrackId;
    isPlayingRef.current = isPlaying;

    // Use local position for smooth playback
    const displayPosition = isPlaying ? localPositionRef.current : (attrs.media_position || 0);

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
        position: displayPosition,
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
      // Edge case states
      isTrackLoading,
      isTrackTransitioning: trackChanged,
      wasExternallyPaused,
      queueEnded,
      errorState: isOff ? 'Spotify not active' : null,
    };
  }, []);

  const syncFromRemote = useCallback(async (forcePositionUpdate: boolean = false) => {
    if (!enabled || !entityId) {
      console.log('useMediaPlayerSync: sync skipped', { enabled, entityId });
      return;
    }

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

      const state = entityToState(entity, forcePositionUpdate);
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

  // Real-time position tracking for playing media - smooth 100ms updates
  useEffect(() => {
    if (!playerState?.isPlaying || !playerState.currentTrack) {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
      return;
    }

    // Update position every 100ms for ultra-smooth progress bar
    positionIntervalRef.current = setInterval(() => {
      setPlayerState(prev => {
        if (!prev || !prev.currentTrack || !prev.isPlaying) return prev;
        
        const newPosition = Math.min(
          localPositionRef.current + 0.1, // Increment by 0.1 seconds (100ms)
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
    }, 100); // Update every 100ms for smooth animation

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

  // Load available speakers on mount
  useEffect(() => {
    const loadSpeakers = async () => {
      if (!enabled) return;
      
      try {
        const speakers = await homeAssistant.getAvailableSpeakers();
        setAvailableSpeakers(speakers);
      } catch (error) {
        console.error('Failed to load available speakers:', error);
      }
    };

    loadSpeakers();
  }, [enabled]);

  // Detect active playback target from HA state
  const detectActiveTarget = useCallback((state: MediaPlayerState): PlaybackTarget | null => {
    const groupMembers = state.groupedSpeakers || [];
    
    // Check if matches a predefined group
    const matchedGroup = PREDEFINED_GROUPS.find(g => 
      g.entityIds.length === groupMembers.length &&
      g.entityIds.every(id => groupMembers.some(member => member === id))
    );
    
    if (matchedGroup) {
      console.log('🎯 Detected active group:', matchedGroup.name);
      return { 
        type: 'group', 
        name: matchedGroup.name, 
        entityIds: matchedGroup.entityIds,
        groupId: matchedGroup.id
      };
    }
    
    if (groupMembers.length > 1) {
      // Custom group (not predefined)
      return { 
        type: 'speaker', 
        name: `${groupMembers.length} speakers`, 
        entityIds: groupMembers 
      };
    }
    
    if (groupMembers.length === 1) {
      return { 
        type: 'speaker', 
        name: state.source, 
        entityIds: groupMembers 
      };
    }
    
    // Default to Spotify Connect
    return { 
      type: 'spotify', 
      name: state.source, 
      entityIds: [] 
    };
  }, []);

  return { 
    playerState, 
    isLoading, 
    syncFromRemote,
    setPlayerState,
    availableSpeakers,
    detectActiveTarget
  };
};
