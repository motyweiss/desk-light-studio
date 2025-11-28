import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Music } from 'lucide-react';
import { homeAssistant } from '@/services/homeAssistant';
import { useMediaPlayerSync } from '@/hooks/useMediaPlayerSync';
import { ProgressBar } from './ProgressBar';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControl } from './VolumeControl';
import { SpeakerSelector } from './SpeakerSelector';
import { SourceIndicator } from './SourceIndicator';

interface MediaPlayerProps {
  entityId: string | undefined;
  isConnected: boolean;
}

export const MediaPlayer = ({ entityId, isConnected }: MediaPlayerProps) => {
  const [isMinimized, setIsMinimized] = useState(true);

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

  console.log('MediaPlayer render:', { 
    entityId, 
    isConnected, 
    isLoading, 
    hasPlayerState: !!playerState,
    availableSpeakers: availableSpeakers.length,
    combinedSources: combinedSources.length
  });

  // Optimistic handlers with immediate UI update
  const handlePlayPause = async () => {
    if (!entityId || !playerState) return;
    
    setPlayerState(prev => prev ? { ...prev, isPlaying: !prev.isPlaying, isPaused: prev.isPlaying } : null);
    await homeAssistant.mediaPlayPause(entityId);
    setTimeout(syncFromRemote, 300);
  };

  const handleNext = async () => {
    if (!entityId) return;
    await homeAssistant.mediaNextTrack(entityId);
    setTimeout(syncFromRemote, 300);
  };

  const handlePrevious = async () => {
    if (!entityId) return;
    await homeAssistant.mediaPreviousTrack(entityId);
    setTimeout(syncFromRemote, 300);
  };

  const handleVolumeChange = async (volume: number) => {
    if (!entityId || !playerState) return;
    
    setPlayerState(prev => prev ? { ...prev, volume } : null);
    await homeAssistant.setMediaVolume(entityId, volume);
  };

  const handleMuteToggle = async () => {
    if (!entityId || !playerState) return;
    
    setPlayerState(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
    await homeAssistant.toggleMediaMute(entityId, playerState.isMuted);
    setTimeout(syncFromRemote, 300);
  };

  const handleShuffleToggle = async () => {
    if (!entityId || !playerState) return;
    
    setPlayerState(prev => prev ? { ...prev, shuffle: !prev.shuffle } : null);
    await homeAssistant.setMediaShuffle(entityId, !playerState.shuffle);
    setTimeout(syncFromRemote, 300);
  };

  const handleRepeatToggle = async () => {
    if (!entityId || !playerState) return;
    
    const nextRepeat = playerState.repeat === 'off' ? 'all' : playerState.repeat === 'all' ? 'one' : 'off';
    setPlayerState(prev => prev ? { ...prev, repeat: nextRepeat } : null);
    await homeAssistant.setMediaRepeat(entityId, nextRepeat);
    setTimeout(syncFromRemote, 300);
  };

  const handleSourceChange = async (source: string) => {
    if (!entityId || !playerState) return;
    
    setPlayerState(prev => prev ? { ...prev, source } : null);
    await homeAssistant.setMediaSource(entityId, source);
    setTimeout(syncFromRemote, 500);
  };

  const handleSeek = async (position: number) => {
    if (!entityId || !playerState?.currentTrack) return;
    
    // Update local state immediately for responsive UI
    setPlayerState(prev => prev?.currentTrack ? {
      ...prev,
      currentTrack: { ...prev.currentTrack, position }
    } : null);
    
    // Seek on HA and force sync after to ensure accuracy
    await homeAssistant.mediaSeek(entityId, position);
    setTimeout(syncFromRemote, 200);
  };

  // Show loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 bg-white/5 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-3 text-white/60">
          <Music className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Loading media player...</span>
        </div>
      </motion.div>
    );
  }

  // Don't render if not connected
  if (!isConnected) {
    return null;
  }

  // Show message if no entity configured
  if (!entityId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 bg-amber-500/10 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-4 shadow-lg max-w-sm"
      >
        <div className="flex items-center gap-3 text-amber-200/90">
          <Music className="w-5 h-5" />
          <div className="text-sm">
            <p className="font-medium">No media player configured</p>
            <p className="text-xs text-amber-200/60 mt-1">Open Settings (⚙️) to select your Spotify player</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Don't render if no player state after loading
  if (!playerState) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 bg-red-500/10 backdrop-blur-2xl border border-red-500/30 rounded-2xl p-4 shadow-lg max-w-sm"
      >
        <div className="flex items-center gap-3 text-red-200/90">
          <Music className="w-5 h-5" />
          <div className="text-sm">
            <p className="font-medium">Media player not found</p>
            <p className="text-xs text-red-200/60 mt-1">
              Entity "{entityId}" not found in Home Assistant. 
              Check console for available media players and update in Settings.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentTrack = playerState.currentTrack;
  const albumArtUrl = currentTrack?.albumArt ? homeAssistant.getFullImageUrl(currentTrack.albumArt) : null;

  // Calculate sizes directly without useMemo to avoid hooks issues
  const albumArtSize = {
    width: isMinimized ? 56 : 64,
    height: isMinimized ? 56 : 64,
  };

  const titleFontSize = isMinimized ? '16px' : '18px';
  const titleLineHeight = isMinimized ? '24px' : '28px';
  const artistFontSize = isMinimized ? '12px' : '14px';
  const artistLineHeight = isMinimized ? '16px' : '20px';

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
      }}
      transition={{ 
        duration: 1, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.3
      }}
      className="fixed bottom-0 left-0 right-0 z-50 w-full"
    >
      <motion.div 
        onClick={() => setIsMinimized(!isMinimized)}
        className="bg-white/8 backdrop-blur-[24px] border-t border-white/20 rounded-t-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] relative cursor-pointer"
        initial={false}
        animate={{ 
          height: isMinimized ? 80 : 'auto',
        }}
        transition={{ 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.25, 1]
        }}
        whileHover={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.09)'
        }}
      >

        {/* Content Container */}
        <div className="px-6 py-3 max-w-7xl mx-auto relative">
          <div className="flex items-center gap-4 relative" style={{ minHeight: isMinimized ? 56 : 'auto' }}>
            {/* Album Art - Shared Element */}
            <motion.div
              layoutId="player-album-art"
              className="relative flex-shrink-0 rounded-xl overflow-hidden bg-white/5"
              initial={false}
              animate={albumArtSize}
              transition={{ 
                duration: 0.5, 
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              {albumArtUrl ? (
                <img 
                  src={albumArtUrl} 
                  alt="Album art" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-8 h-8 text-white/20" />
                </div>
              )}
            </motion.div>

            {/* Track Info - Shared Element */}
            <motion.div
              layoutId="player-track-info"
              className="flex-1 min-w-0"
              initial={false}
            >
              <motion.h3
                className="text-white font-light truncate"
                initial={false}
                animate={{ 
                  fontSize: titleFontSize,
                  lineHeight: titleLineHeight
                }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {currentTrack?.title || 'No media playing'}
              </motion.h3>
              <motion.p 
                className="text-white/40 truncate"
                initial={false}
                animate={{ 
                  fontSize: artistFontSize,
                  lineHeight: artistLineHeight
                }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {currentTrack?.artist || 'Unknown Artist'}
              </motion.p>
              
              {/* Album name - Only in full mode */}
              <AnimatePresence>
                {!isMinimized && currentTrack?.album && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-white/30 text-xs truncate mt-0.5"
                  >
                    {currentTrack.album}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Spotify Logo - Positioned on the right */}
            <motion.div
              className="absolute right-0 flex items-center justify-center"
              initial={false}
              animate={{
                top: isMinimized ? '50%' : 8,
                translateY: isMinimized ? '-50%' : 0,
                opacity: 0.15,
                scale: isMinimized ? 1 : 0.85,
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <svg 
                width={isMinimized ? 32 : 28} 
                height={isMinimized ? 32 : 28} 
                viewBox="0 0 24 24" 
                fill="currentColor"
                className="text-white"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </motion.div>

            {/* Mini Player Controls - Always in DOM, visibility controlled */}
            {isMinimized && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex items-center gap-6 mr-12"
                onClick={(e) => e.stopPropagation()}
              >
                <PlaybackControls
                  isPlaying={playerState.isPlaying}
                  shuffle={playerState.shuffle}
                  repeat={playerState.repeat}
                  onPlayPause={handlePlayPause}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onShuffleToggle={handleShuffleToggle}
                  onRepeatToggle={handleRepeatToggle}
                />

                <VolumeControl
                  volume={playerState.volume}
                  isMuted={playerState.isMuted}
                  onVolumeChange={handleVolumeChange}
                  onMuteToggle={handleMuteToggle}
                />

                <SourceIndicator appName={playerState.appName} />
              </motion.div>
            )}
          </div>

          {/* Full Player Controls - Separate section */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ 
                  duration: 0.45,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className="space-y-4 mt-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Source Indicator */}
                <div className="flex justify-end">
                  <SourceIndicator appName={playerState.appName} />
                </div>

                {/* Progress Bar */}
                {currentTrack && (
                  <ProgressBar
                    position={currentTrack.position}
                    duration={currentTrack.duration}
                    onSeek={handleSeek}
                  />
                )}

                {/* Bottom Row: Playback Controls + Volume + Speaker Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <PlaybackControls
                      isPlaying={playerState.isPlaying}
                      shuffle={playerState.shuffle}
                      repeat={playerState.repeat}
                      onPlayPause={handlePlayPause}
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      onShuffleToggle={handleShuffleToggle}
                      onRepeatToggle={handleRepeatToggle}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <VolumeControl
                      volume={playerState.volume}
                      isMuted={playerState.isMuted}
                      onVolumeChange={handleVolumeChange}
                      onMuteToggle={handleMuteToggle}
                    />

                    {combinedSources.length > 0 && (
                      <SpeakerSelector
                        currentSource={playerState.source}
                        spotifySources={playerState.availableSources}
                        availableSpeakers={availableSpeakers}
                        onSourceChange={handleSourceChange}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
