import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useMediaPlayerSync } from '@/hooks/useMediaPlayerSync';
import { homeAssistant } from '@/services/homeAssistant';
import type { MediaPlayerState } from '@/types/mediaPlayer';
import type { MediaPlayerEntity } from '@/services/homeAssistant';

interface MediaPlayerContextType {
  playerState: MediaPlayerState | null;
  isLoading: boolean;
  availableSpeakers: MediaPlayerEntity[];
  combinedSources: string[];
  entityId: string | undefined;
  isConnected: boolean;
  handlePlayPause: () => Promise<void>;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  handleVolumeChange: (volume: number) => Promise<void>;
  handleMuteToggle: () => Promise<void>;
  handleShuffleToggle: () => Promise<void>;
  handleRepeatToggle: () => Promise<void>;
  handleSourceChange: (source: string) => Promise<void>;
  handleSeek: (position: number) => Promise<void>;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

interface MediaPlayerProviderProps {
  children: ReactNode;
  entityId: string | undefined;
  isConnected: boolean;
}

export const MediaPlayerProvider = ({ children, entityId, isConnected }: MediaPlayerProviderProps) => {
  const { 
    playerState, 
    isLoading, 
    syncFromRemote, 
    setPlayerState,
    availableSpeakers,
    combinedSources 
  } = useMediaPlayerSync({
    entityId,
    enabled: isConnected && !!entityId,
    pollInterval: 1500,
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

  const handleSourceChange = useCallback(async (source: string) => {
    if (!entityId || !playerState) return;
    
    setPlayerState(prev => prev ? { ...prev, source } : null);
    await homeAssistant.setMediaSource(entityId, source);
    setTimeout(syncFromRemote, 500);
  }, [entityId, playerState, setPlayerState, syncFromRemote]);

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

  const value: MediaPlayerContextType = {
    playerState,
    isLoading,
    availableSpeakers,
    combinedSources,
    entityId,
    isConnected,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleVolumeChange,
    handleMuteToggle,
    handleShuffleToggle,
    handleRepeatToggle,
    handleSourceChange,
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