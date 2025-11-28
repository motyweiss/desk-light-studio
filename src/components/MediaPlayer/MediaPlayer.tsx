import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronUp, Music } from 'lucide-react';
import { homeAssistant } from '@/services/homeAssistant';
import { useMediaPlayerSync } from '@/hooks/useMediaPlayerSync';
import { AlbumArt } from './AlbumArt';
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
    
    setPlayerState(prev => prev?.currentTrack ? {
      ...prev,
      currentTrack: { ...prev.currentTrack, position }
    } : null);
    await homeAssistant.mediaSeek(entityId, position);
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

  return (
    <motion.div
      initial={{ y: 150, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
      }}
      transition={{ 
        duration: 0.9, 
        ease: [0.19, 1, 0.22, 1],
        delay: 0.2
      }}
      className="fixed bottom-0 left-0 right-0 z-50 w-full"
    >
      <motion.div 
        className="bg-white/8 backdrop-blur-[24px] border-t border-white/20 rounded-t-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] max-w-none relative"
        style={{ overflow: 'visible' }}
        animate={{ 
          height: isMinimized ? '80px' : 'auto',
        }}
        transition={{ 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        {/* Minimize/Maximize Button */}
        <motion.button
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute left-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white/5 backdrop-blur-2xl border border-white/15 flex items-center justify-center shadow-sm"
          style={{ top: '-18px' }}
          whileHover={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.25)'
          }}
          whileTap={{ 
            scale: 0.95,
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{
            duration: 0.15,
            ease: "easeOut"
          }}
        >
          <motion.div
            animate={{ 
              rotate: isMinimized ? 0 : 180
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            <ChevronUp className="w-4 h-4 text-white" />
          </motion.div>
        </motion.button>

        {isMinimized ? (
          /* Mini Player */
          <motion.div
            key="mini"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ 
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="flex items-center gap-4 px-6 py-3 max-w-7xl mx-auto"
          >
            {/* Album Art - smaller */}
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
              {albumArtUrl ? (
                <img 
                  src={albumArtUrl} 
                  alt="Album art" 
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-light text-base truncate">
                {currentTrack?.title || 'No media playing'}
              </h3>
              <p className="text-white/40 text-xs truncate">
                {currentTrack?.artist || 'Unknown Artist'}
              </p>
            </div>

            {/* Mini Controls */}
            <div className="flex items-center gap-6">
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
            </div>
          </motion.div>
        ) : (
          /* Full Player */
          <motion.div
            key="full"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ 
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="space-y-4 px-6 py-6 max-w-7xl mx-auto"
          >
            {/* Top Row: Album Art + Track Info + Source */}
            <div className="flex items-start gap-4">
              <AlbumArt 
                albumArt={albumArtUrl} 
                isPlaying={playerState.isPlaying}
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-light text-lg truncate">
                  {currentTrack?.title || 'No media playing'}
                </h3>
                <p className="text-white/40 text-sm truncate">
                  {currentTrack?.artist || 'Unknown Artist'}
                </p>
                {currentTrack?.album && (
                  <p className="text-white/30 text-xs truncate">
                    {currentTrack.album}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <SourceIndicator appName={playerState.appName} />
              </div>
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
      </motion.div>
    </motion.div>
  );
};
