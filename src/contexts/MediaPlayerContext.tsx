import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useMediaPlayerSync } from '@/hooks/useMediaPlayerSync';
import { homeAssistant } from '@/services/homeAssistant';
import type { MediaPlayerState, PlaybackTarget } from '@/types/mediaPlayer';
import type { MediaPlayerEntity } from '@/services/homeAssistant';
import { PREDEFINED_GROUPS, SPEAKER_ENTITY_MAP, type SpeakerGroup } from '@/config/speakerGroups';
import { POLL_INTERVAL } from '@/constants/animations';

interface MediaPlayerContextType {
  playerState: MediaPlayerState | null;
  isLoading: boolean;
  availableSpeakers: MediaPlayerEntity[];
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
    pollInterval: POLL_INTERVAL.mediaPlayer, // Fast polling for immediate music detection
  });

  // Optimistic handlers with immediate UI update
  const handlePlayPause = useCallback(async () => {
    if (!entityId || !playerState) return;
    
    setPlayerState(prev => prev ? { ...prev, isPlaying: !prev.isPlaying, isPaused: prev.isPlaying } : null);
    await homeAssistant.mediaPlayPause(entityId);
    setTimeout(syncFromRemote, 300);
  }, [entityId, playerState, setPlayerState, syncFromRemote]);

  const handleNext = useCallback(async () => {
    if (!entityId) return;
    await homeAssistant.mediaNextTrack(entityId);
    setTimeout(syncFromRemote, 300);
  }, [entityId, syncFromRemote]);

  const handlePrevious = useCallback(async () => {
    if (!entityId) return;
    await homeAssistant.mediaPreviousTrack(entityId);
    setTimeout(syncFromRemote, 300);
  }, [entityId, syncFromRemote]);

  const handleVolumeChange = useCallback(async (volume: number) => {
    if (!entityId || !playerState) return;
    
    setPlayerState(prev => prev ? { ...prev, volume } : null);
    await homeAssistant.setMediaVolume(entityId, volume);
  }, [entityId, playerState, setPlayerState]);

  const handleMuteToggle = useCallback(async () => {
    if (!entityId || !playerState) return;
    
    setPlayerState(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
    await homeAssistant.toggleMediaMute(entityId, playerState.isMuted);
    setTimeout(syncFromRemote, 300);
  }, [entityId, playerState, setPlayerState, syncFromRemote]);

  const handleShuffleToggle = useCallback(async () => {
    if (!entityId || !playerState) return;
    
    setPlayerState(prev => prev ? { ...prev, shuffle: !prev.shuffle } : null);
    await homeAssistant.setMediaShuffle(entityId, !playerState.shuffle);
    setTimeout(syncFromRemote, 300);
  }, [entityId, playerState, setPlayerState, syncFromRemote]);

  const handleRepeatToggle = useCallback(async () => {
    if (!entityId || !playerState) return;
    
    const nextRepeat = playerState.repeat === 'off' ? 'all' : playerState.repeat === 'all' ? 'one' : 'off';
    setPlayerState(prev => prev ? { ...prev, repeat: nextRepeat } : null);
    await homeAssistant.setMediaRepeat(entityId, nextRepeat);
    setTimeout(syncFromRemote, 300);
  }, [entityId, playerState, setPlayerState, syncFromRemote]);

  // Handler for Spotify Connect source selection
  const handleSpotifySourceChange = useCallback(async (source: string) => {
    if (!entityId) return;
    
    console.log('🎵 Selecting Spotify Connect source:', source);
    
    setCurrentPlaybackTarget({ 
      type: 'spotify', 
      name: source, 
      entityIds: [] 
    });
    
    await homeAssistant.setMediaSource(entityId, source);
    setTimeout(syncFromRemote, 500);
  }, [entityId, syncFromRemote]);

  // Handler for individual Sonos speaker selection
  const handleSpeakerSelect = useCallback(async (speakerEntityId: string, friendlyName: string) => {
    if (!entityId) return;
    
    console.log('🔊 Selecting speaker:', friendlyName, speakerEntityId);
    
    setCurrentPlaybackTarget({ 
      type: 'speaker', 
      name: friendlyName, 
      entityIds: [speakerEntityId] 
    });
    
    // Transfer playback to the selected Sonos speaker
    await homeAssistant.transferPlaybackToSonos(entityId, speakerEntityId, friendlyName);
    setTimeout(syncFromRemote, 800);
  }, [entityId, syncFromRemote]);

  // Handler for speaker group selection
  const handleGroupSelect = useCallback(async (group: SpeakerGroup) => {
    if (!entityId) return;
    
    console.log('👥 Selecting speaker group:', group.name, group.entityIds);
    
    setCurrentPlaybackTarget({ 
      type: 'group', 
      name: group.name, 
      entityIds: group.entityIds,
      groupId: group.id
    });
    
    // First, create the speaker group
    await homeAssistant.playOnSpeakerGroup(group.masterEntityId, group.entityIds, group.name);
    
    // Then, transfer Spotify playback to the group master
    await homeAssistant.transferPlaybackToSonos(entityId, group.masterEntityId, group.name);
    
    setTimeout(syncFromRemote, 800);
  }, [entityId, syncFromRemote]);

  const handleSeek = useCallback(async (position: number) => {
    if (!entityId || !playerState?.currentTrack) return;
    
    // Update local state immediately for responsive UI
    setPlayerState(prev => prev?.currentTrack ? {
      ...prev,
      currentTrack: { ...prev.currentTrack, position }
    } : null);
    
    // Seek on HA and force sync after to ensure accuracy
    await homeAssistant.mediaSeek(entityId, position);
    setTimeout(syncFromRemote, 200);
  }, [entityId, playerState, setPlayerState, syncFromRemote]);

  // Set default group on initial load if no source detected
  useEffect(() => {
    if (!playerState || !isConnected || !entityId) return;
    
    // Only auto-select if no playback target is currently set
    if (!currentPlaybackTarget) {
      const defaultGroup = PREDEFINED_GROUPS.find(g => g.isDefault);
      if (defaultGroup) {
        console.log('🎯 Auto-selecting default group:', defaultGroup.name);
        handleGroupSelect(defaultGroup);
      }
    }
  }, [playerState, isConnected, entityId, currentPlaybackTarget, handleGroupSelect]);

  // Update playback target when player state changes
  useEffect(() => {
    if (!playerState) return;
    
    const detectedTarget = detectActiveTarget(playerState);
    if (detectedTarget && !currentPlaybackTarget) {
      setCurrentPlaybackTarget(detectedTarget);
    }
  }, [playerState, detectActiveTarget, currentPlaybackTarget]);

  const value: MediaPlayerContextType = {
    playerState,
    isLoading,
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