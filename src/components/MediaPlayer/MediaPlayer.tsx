import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { Music, AlertCircle } from 'lucide-react';
import { homeAssistant } from '@/services/homeAssistant';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { ProgressBar } from './ProgressBar';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControl } from './VolumeControl';
import { SourceIndicator } from './SourceIndicator';
import { MiniSpeakerBadge } from './MiniSpeakerBadge';
import { SpeakerPopover } from './SpeakerPopover';
import { AudioVisualizer } from './AudioVisualizer';
import { MusicParticles } from './MusicParticles';

export const MediaPlayer = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [speakerPopoverOpen, setSpeakerPopoverOpen] = useState(false);
  const speakerBadgeRef = useRef<HTMLButtonElement>(null);

  const {
    playerState,
    isLoading,
    availableSpeakers,
    predefinedGroups,
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
  } = useMediaPlayer();

  // Show loading state - return null to hide loading message
  if (isLoading) {
    return null;
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
        className="fixed bottom-6 right-6 bg-amber-500/10 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-4 shadow-lg max-w-sm z-50"
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
        className="fixed bottom-6 right-6 bg-red-500/10 backdrop-blur-2xl border border-red-500/30 rounded-2xl p-4 shadow-lg max-w-sm z-50"
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

  // Hide player only if truly off/idle with no track
  if (playerState.isOff && !playerState.currentTrack) {
    return null;
  }

  // Hide player when queue ended (idle state after playback)
  if (playerState.queueEnded && !playerState.isPlaying) {
    return null;
  }

  const currentTrack = playerState.currentTrack;
  const albumArtUrl = currentTrack?.albumArt ? homeAssistant.getFullImageUrl(currentTrack.albumArt) : null;

  // Calculate album art sizes
  const albumArtSize = {
    width: isMinimized ? 56 : 64,
    height: isMinimized ? 56 : 64,
  };

  

  return (
    <>
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
            height: isMinimized ? 88 : 'auto',
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
          <div className="px-4 md:px-6 py-3 max-w-7xl mx-auto">
            {/* Grid layout: 3 columns in mini mode, single column in full mode */}
            <div className={`${isMinimized 
              ? 'grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4 lg:gap-6' 
              : 'flex flex-col'
            }`}>
              
              {/* Left Section: Album Art + Track Info */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Album Art - Shared Element */}
                <motion.div
                  layoutId="player-album-art"
                  className="relative flex-shrink-0 rounded-xl overflow-hidden bg-white/5"
                  initial={false}
                  animate={albumArtSize}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.32, 0.72, 0, 1]
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTrack?.title || 'no-track'}
                      initial={{ opacity: 0, scale: 0.88, y: 8 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: 0
                      }}
                      exit={{ opacity: 0, scale: 1.05, y: -4 }}
                      transition={{ 
                        duration: 0.5,
                        ease: [0.34, 1.56, 0.64, 1],
                        opacity: { duration: 0.3 }
                      }}
                      className="absolute inset-0"
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
                  </AnimatePresence>
                  
                  {/* Music Particles Effect */}
                  <MusicParticles 
                    isPlaying={playerState.isPlaying} 
                    containerSize={albumArtSize}
                  />
                </motion.div>

                {/* Track Info - Shared Element */}
                <motion.div
                  className="flex-1 min-w-0 relative"
                  initial={false}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${currentTrack?.title}-${currentTrack?.artist}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <motion.div
                        className="origin-left"
                        initial={false}
                        animate={{ 
                          scale: isMinimized ? 1 : 1.125,
                        }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                      >
                        <h3 className="text-white font-light truncate text-sm sm:text-base">
                          {currentTrack?.title || 'No media playing'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-white/40 truncate text-xs">
                            {currentTrack?.artist || 'Unknown Artist'}
                          </p>
                          {isMinimized && playerState.isPlaying && (
                            <AudioVisualizer isPlaying={true} barCount={3} />
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Album name - Only in full mode */}
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
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Center Section: Mini Controls (desktop/tablet only) */}
              {isMinimized && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="hidden sm:flex items-center justify-center gap-3 lg:gap-6"
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <PlaybackControls
                      isPlaying={playerState.isPlaying}
                      shuffle={playerState.shuffle}
                      repeat={playerState.repeat}
                      onPlayPause={handlePlayPause}
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      onShuffleToggle={handleShuffleToggle}
                      onRepeatToggle={handleRepeatToggle}
                      compact={true}
                    />
                  </div>

                  <div className="hidden lg:block" onClick={(e) => e.stopPropagation()}>
                    <VolumeControl
                      volume={playerState.volume}
                      isMuted={playerState.isMuted}
                      onVolumeChange={handleVolumeChange}
                      onMuteToggle={handleMuteToggle}
                      compact={true}
                    />
                  </div>
                </motion.div>
              )}

              {/* Right Section: Speaker Badge + Spotify Logo */}
              {isMinimized && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-3 justify-end"
                >
                  <MiniSpeakerBadge
                    ref={speakerBadgeRef}
                    playbackTarget={currentPlaybackTarget}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpeakerPopoverOpen(true);
                    }}
                    compact={true}
                  />

                  <svg 
                    width={24} 
                    height={24} 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    className="text-white opacity-25 hidden sm:block"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </motion.div>
              )}
            </div>

            {/* Full Player Controls */}
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
                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <ProgressBar
                        position={currentTrack.position}
                        duration={currentTrack.duration}
                        isLoading={playerState.isTrackLoading}
                        isTransitioning={playerState.isTrackTransitioning}
                        onSeek={handleSeek}
                      />
                    </div>
                  )}

                  {/* Bottom Row: Playback Controls + Volume + Speaker Selector */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1" onClick={(e) => e.stopPropagation()}>
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

                    <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                      <VolumeControl
                        volume={playerState.volume}
                        isMuted={playerState.isMuted}
                        onVolumeChange={handleVolumeChange}
                        onMuteToggle={handleMuteToggle}
                      />

                      <MiniSpeakerBadge
                        ref={speakerBadgeRef}
                        playbackTarget={currentPlaybackTarget}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpeakerPopoverOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Speaker Popover */}
      <SpeakerPopover
        isOpen={speakerPopoverOpen}
        onClose={() => setSpeakerPopoverOpen(false)}
        currentPlaybackTarget={currentPlaybackTarget}
        spotifySources={playerState.availableSources}
        availableSpeakers={availableSpeakers}
        predefinedGroups={predefinedGroups}
        onSpotifySourceSelect={handleSpotifySourceChange}
        onSpeakerSelect={handleSpeakerSelect}
        onGroupSelect={handleGroupSelect}
        anchorRef={speakerBadgeRef}
      />
    </>
  );
};