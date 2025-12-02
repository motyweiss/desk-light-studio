import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useMediaPlayerSync } from '../hooks/useMediaPlayerSync';
import { mediaPlayer } from '@/api/homeAssistant';
import { logger } from '@/shared/utils/logger';
import { useDebouncedCallback } from '@/shared/hooks';
import type { MediaPlayerState, PlaybackTarget } from '@/types/mediaPlayer';
import type { HAMediaPlayerEntity } from '@/api/homeAssistant/types';
import { PREDEFINED_GROUPS, type SpeakerGroup } from '@/config/speakerGroups';
import { POLL_INTERVAL } from '@/constants/animations';

// Demo state for disconnected mode
const DEMO_PLAYER_STATE: MediaPlayerState = {
  isPlaying: false,
  isPaused: true,
  isIdle: false,
  isOff: false,
  volume: 65,
  isMuted: false,
  currentTrack: {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    albumArt: null,
    duration: 354,
    position: 0,
  },
  shuffle: false,
  repeat: 'off',
  source: "Spotify",
  availableSources: [],
  groupedSpeakers: [],
  appName: "Spotify",
  isPending: false,
  isLoading: false,
  entityId: 'demo',
  isTrackLoading: false,
  isTrackTransitioning: false,
  wasExternallyPaused: false,
  queueEnded: false,
  errorState: null,
};

interface MediaPlayerContextType {
  playerState: MediaPlayerState | null;
  isLoading: boolean;
  availableSpeakers: HAMediaPlayerEntity[];
  predefinedGroups: SpeakerGroup[];
  currentPlaybackTarget: PlaybackTarget | null;
  entityId: string | undefined;
  isConnected: boolean;
  handlePlayPause: () => Promise<void>;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  handleVolumeChange: (volume: number) => Promise<void>;
  handleMuteToggle: () => Promise<void>;
  handleShuffleToggle: () => Promise<void>;
  handleRepeatToggle: () => Promise<void>;
  handleSpotifySourceChange: (source: string) => Promise<void>;
  handleSpeakerSelect: (entityId: string, friendlyName: string) => Promise<void>;
  handleGroupSelect: (group: SpeakerGroup) => Promise<void>;
  handleSeek: (position: number) => Promise<void>;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

interface MediaPlayerProviderProps {
  children: ReactNode;
  entityId: string | undefined;
  isConnected: boolean;
}

export const MediaPlayerProvider = ({ children, entityId, isConnected }: MediaPlayerProviderProps) => {
  const [currentPlaybackTarget, setCurrentPlaybackTarget] = useState<PlaybackTarget | null>(null);
  
  const { 
    playerState, 
    isLoading, 
    syncFromRemote, 
    setPlayerState,
    availableSpeakers,
    detectActiveTarget
  } = useMediaPlayerSync({
    entityId,
    enabled: isConnected && !!entityId,
    pollInterval: POLL_INTERVAL.mediaPlayer,
  });

  const isDemoMode = !isConnected || !entityId;
  const effectivePlayerState = isDemoMode ? DEMO_PLAYER_STATE : playerState;

  // Optimistic update helpers
  const withOptimisticUpdate = useCallback(
    async (
      stateUpdate: (prev: MediaPlayerState | null) => MediaPlayerState | null,
      apiCall: () => Promise<void>,
      syncDelay: number = 300
    ) => {
      if (isDemoMode || !entityId) return;

      setPlayerState(stateUpdate);
      
      try {
        await apiCall();
        setTimeout(syncFromRemote, syncDelay);
      } catch (error) {
        logger.error('Media player action failed', error);
        syncFromRemote();
      }
    },
    [isDemoMode, entityId, setPlayerState, syncFromRemote]
  );

  // Playback controls
  const handlePlayPause = useCallback(async () => {
    if (!entityId || !playerState) return;
    
    await withOptimisticUpdate(
      prev => prev ? { ...prev, isPlaying: !prev.isPlaying, isPaused: prev.isPlaying } : null,
      async () => {
        if (playerState.isPlaying) {
          await mediaPlayer.pause(entityId);
        } else {
          await mediaPlayer.play(entityId);
        }
      }
    );
  }, [entityId, playerState, withOptimisticUpdate]);

  const handleNext = useCallback(async () => {
    if (!entityId) return;
    await withOptimisticUpdate(
      prev => prev,
      () => mediaPlayer.nextTrack(entityId)
    );
  }, [entityId, withOptimisticUpdate]);

  const handlePrevious = useCallback(async () => {
    if (!entityId) return;
    await withOptimisticUpdate(
      prev => prev,
      () => mediaPlayer.previousTrack(entityId)
    );
  }, [entityId, withOptimisticUpdate]);

  // Volume controls with debouncing
  const debouncedVolumeChange = useDebouncedCallback(
    async (entityId: string, volume: number) => {
      await mediaPlayer.setVolume(entityId, volume / 100);
    },
    300
  );

  const handleVolumeChange = useCallback(async (volume: number) => {
    if (!entityId) return;
    
    setPlayerState(prev => prev ? { ...prev, volume } : null);
    debouncedVolumeChange(entityId, volume);
  }, [entityId, setPlayerState, debouncedVolumeChange]);

  const handleMuteToggle = useCallback(async () => {
    if (!entityId || !playerState) return;
    
    await withOptimisticUpdate(
      prev => prev ? { ...prev, isMuted: !prev.isMuted } : null,
      () => mediaPlayer.setMute(entityId, !playerState.isMuted)
    );
  }, [entityId, playerState, withOptimisticUpdate]);

  const handleShuffleToggle = useCallback(async () => {
    if (!entityId || !playerState) return;
    
    await withOptimisticUpdate(
      prev => prev ? { ...prev, shuffle: !prev.shuffle } : null,
      () => mediaPlayer.setShuffle(entityId, !playerState.shuffle)
    );
  }, [entityId, playerState, withOptimisticUpdate]);

  const handleRepeatToggle = useCallback(async () => {
    if (!entityId || !playerState) return;
    
    const nextRepeat = playerState.repeat === 'off' ? 'all' : playerState.repeat === 'all' ? 'one' : 'off';
    
    await withOptimisticUpdate(
      prev => prev ? { ...prev, repeat: nextRepeat } : null,
      () => mediaPlayer.setRepeat(entityId, nextRepeat)
    );
  }, [entityId, playerState, withOptimisticUpdate]);

  // Source/Speaker selection
  const handleSpotifySourceChange = useCallback(async (source: string) => {
    if (!entityId) return;
    
    logger.media(`Selecting Spotify source: ${source}`);
    setCurrentPlaybackTarget({ type: 'spotify', name: source, entityIds: [] });
    
    await mediaPlayer.selectSource(entityId, source);
    setTimeout(syncFromRemote, 500);
  }, [entityId, syncFromRemote]);

  const handleSpeakerSelect = useCallback(async (speakerEntityId: string, friendlyName: string) => {
    if (!entityId) return;
    
    logger.media(`Selecting speaker: ${friendlyName}`);
    setCurrentPlaybackTarget({ type: 'speaker', name: friendlyName, entityIds: [speakerEntityId] });
    
    // Transfer playback - implementation depends on HA setup
    await mediaPlayer.selectSource(entityId, friendlyName);
    setTimeout(syncFromRemote, 800);
  }, [entityId, syncFromRemote]);

  const handleGroupSelect = useCallback(async (group: SpeakerGroup) => {
    if (!entityId) return;
    
    logger.media(`Selecting group: ${group.name}`);
    setCurrentPlaybackTarget({ 
      type: 'group', 
      name: group.name, 
      entityIds: group.entityIds,
      groupId: group.id
    });
    
    await mediaPlayer.joinSpeakers(group.masterEntityId, group.entityIds);
    await mediaPlayer.selectSource(entityId, group.name);
    setTimeout(syncFromRemote, 800);
  }, [entityId, syncFromRemote]);

  // Seek with debouncing
  const debouncedSeek = useDebouncedCallback(
    async (entityId: string, position: number) => {
      await mediaPlayer.seek(entityId, position);
      setTimeout(syncFromRemote, 200);
    },
    300
  );

  const handleSeek = useCallback(async (position: number) => {
    if (!entityId || !playerState?.currentTrack) return;
    
    setPlayerState(prev => prev?.currentTrack ? {
      ...prev,
      currentTrack: { ...prev.currentTrack, position }
    } : null);
    
    debouncedSeek(entityId, position);
  }, [entityId, playerState, setPlayerState, debouncedSeek]);

  // Auto-select default group
  useEffect(() => {
    if (!playerState || !isConnected || !entityId || currentPlaybackTarget) return;
    
    const defaultGroup = PREDEFINED_GROUPS.find(g => g.isDefault);
    if (defaultGroup) {
      logger.media(`Auto-selecting default group: ${defaultGroup.name}`);
      handleGroupSelect(defaultGroup);
    }
  }, [playerState, isConnected, entityId, currentPlaybackTarget, handleGroupSelect]);

  // Update playback target from state
  useEffect(() => {
    if (!playerState || currentPlaybackTarget) return;
    
    const detectedTarget = detectActiveTarget(playerState);
    if (detectedTarget) {
      setCurrentPlaybackTarget(detectedTarget);
    }
  }, [playerState, detectActiveTarget, currentPlaybackTarget]);

  const value: MediaPlayerContextType = {
    playerState: effectivePlayerState,
    isLoading: isDemoMode ? false : isLoading,
    availableSpeakers,
    predefinedGroups: PREDEFINED_GROUPS,
    currentPlaybackTarget,
    entityId,
    isConnected,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleVolumeChange,
    handleMuteToggle,
    handleShuffleToggle,
    handleRepeatToggle,
    handleSpotifySourceChange,
    handleSpeakerSelect,
    handleGroupSelect,
    handleSeek,
  };

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
    </MediaPlayerContext.Provider>
  );
};

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (context === undefined) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
};
