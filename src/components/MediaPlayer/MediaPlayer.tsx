import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ChevronUp, Music } from 'lucide-react';
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

  // Memoize animation configurations to prevent re-creation on every render
  const albumArtSize = useMemo(() => ({
    width: isMinimized ? 56 : 64,
    height: isMinimized ? 56 : 64,
  }), [isMinimized]);

  const titleFontSize = useMemo(() => 
    isMinimized ? '16px' : '18px'
  , [isMinimized]);

  const titleLineHeight = useMemo(() => 
    isMinimized ? '24px' : '28px'
  , [isMinimized]);

  const artistFontSize = useMemo(() => 
    isMinimized ? '12px' : '14px'
  , [isMinimized]);

  const artistLineHeight = useMemo(() => 
    isMinimized ? '16px' : '20px'
  , [isMinimized]);

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.19, 1, 0.22, 1],
        delay: 0.3
      }}
      className="fixed bottom-0 left-0 right-0 z-50 w-full"
    >
      <motion.div 
        className="bg-white/8 backdrop-blur-[24px] border-t border-white/20 rounded-t-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] relative"
        initial={false}
        animate={{ 
          height: isMinimized ? 80 : 'auto',
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.32, 0.72, 0, 1]
        }}
      >
        {/* Chevron Button */}
        <motion.button
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-7 h-7 rounded-full bg-[hsl(28_18%_20%)] border border-white/20 flex items-center justify-center"
          whileHover={{ 
            backgroundColor: 'hsl(28 18% 25%)',
            scale: 1.05,
          }}
          whileTap={{ 
            scale: 0.95,
          }}
        >
          <motion.div
            initial={false}
            animate={{ 
              rotate: isMinimized ? 0 : 180
            }}
            transition={{ 
              duration: 0.35, 
              ease: [0.32, 0.72, 0, 1]
            }}
          >
            <ChevronUp className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </motion.button>

        {/* Content Container */}
        <div className="px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 relative" style={{ minHeight: isMinimized ? 56 : 'auto' }}>
            {/* Album Art - Shared Element */}
            <motion.div
              layoutId="player-album-art"
              className="relative flex-shrink-0 rounded-xl overflow-hidden bg-white/5"
              initial={false}
              animate={albumArtSize}
              transition={{ 
                duration: 0.4, 
                ease: [0.32, 0.72, 0, 1]
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
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
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
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
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
                    transition={{ duration: 0.25 }}
                    className="text-white/30 text-xs truncate mt-0.5"
                  >
                    {currentTrack.album}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Mini Player Controls - Always in DOM, visibility controlled */}
            {isMinimized && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="flex items-center gap-6"
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
                  duration: 0.35,
                  ease: [0.32, 0.72, 0, 1]
                }}
                className="space-y-4 mt-4 overflow-hidden"
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
