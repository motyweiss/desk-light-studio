import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Music } from 'lucide-react';
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage';
import { useMediaPlayer, useMediaPlayerUI, PLAYER_HEIGHTS } from '@/features/mediaPlayer';
import { ProgressBar } from './ProgressBar';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControl } from './VolumeControl';
import { SourceIndicator } from './SourceIndicator';
import { MiniSpeakerBadge } from './MiniSpeakerBadge';
import { SpeakerPopover } from './SpeakerPopover';
import { AudioVisualizer } from './AudioVisualizer';
import { MusicParticles } from './MusicParticles';
import { MEDIA_PLAYER_ANIMATIONS, EASING } from '@/constants/animations';

export const MediaPlayer = () => {
  const [isMinimized, setIsMinimizedLocal] = useState(true);
  const [speakerPopoverOpen, setSpeakerPopoverOpen] = useState(false);
  const speakerBadgeRef = useRef<HTMLButtonElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // UI Context for communicating with RootLayout
  const { setIsMinimized, setIsVisible, setPlayerHeight } = useMediaPlayerUI();

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

  // Debug: Log player state and album art
  console.log('[MediaPlayer] playerState:', {
    hasPlayerState: !!playerState,
    isLoading,
    currentTrack: playerState?.currentTrack,
    albumArt: playerState?.currentTrack?.albumArt,
  });

  // Fetch album art with authentication
  const { 
    imageUrl: albumArtUrl, 
    isLoading: isAlbumArtLoading, 
    error: albumArtError,
    isTransitioning: isAlbumArtTransitioning 
  } = useAuthenticatedImage(
    playerState?.currentTrack?.albumArt || null
  );

  // Debug: Log album art loading state
  console.log('[MediaPlayer] Album art state:', {
    albumArtPath: playerState?.currentTrack?.albumArt,
    albumArtUrl: albumArtUrl ? 'loaded' : 'null',
    isAlbumArtLoading,
    albumArtError,
  });

  // Sync visibility with UI context
  const isPlayerVisible = !isLoading && playerState && 
    !(playerState.isOff && !playerState.currentTrack) &&
    !(playerState.queueEnded && !playerState.isPlaying);

  useEffect(() => {
    setIsVisible(isPlayerVisible);
    if (isPlayerVisible) {
      setPlayerHeight(isMinimized ? PLAYER_HEIGHTS.minimized : PLAYER_HEIGHTS.expanded);
    }
  }, [isPlayerVisible, isMinimized, setIsVisible, setPlayerHeight]);

  // Sync minimized state with UI context
  useEffect(() => {
    setIsMinimized(isMinimized);
  }, [isMinimized, setIsMinimized]);

  // Toggle handler
  const handleToggleMinimized = () => {
    setIsMinimizedLocal(prev => !prev);
  };

  // Hide player only during loading or if no player state
  if (isLoading || !playerState) {
    return null;
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

  // Calculate album art sizes
  const albumArtSize = {
    width: isMinimized ? 48 : 64,
    height: isMinimized ? 48 : 64,
  };

  // Unified transition system - single easing for consistency
  const ease = [0.32, 0.72, 0, 1] as const;
  
  const containerTransition = { duration: 0.35, ease };
  const contentTransition = { duration: 0.3, ease };
  const elementTransition = { duration: 0.25, ease };
  const stagger = 0.04;

  return (
    <>
      <motion.div
        ref={playerRef}
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
        }}
        transition={{ 
          duration: MEDIA_PLAYER_ANIMATIONS.entry.duration, 
          ease: EASING.entrance,
          delay: MEDIA_PLAYER_ANIMATIONS.entry.delay,
        }}
        className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4"
      >
        <motion.div 
          onClick={handleToggleMinimized}
          className="w-full max-w-2xl relative cursor-pointer overflow-hidden"
          initial={false}
          animate={{ 
            height: isMinimized ? 64 : 'auto',
            borderRadius: isMinimized ? 32 : 24,
            backgroundColor: isMinimized ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.18)',
          }}
          transition={containerTransition}
          whileHover={{ 
            backgroundColor: isMinimized ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.22)'
          }}
          style={{
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: isMinimized 
              ? '0 4px 24px rgba(0,0,0,0.15)' 
              : '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >

          {/* Content Container */}
          <motion.div 
            className={isMinimized ? 'px-2 py-2' : 'px-5 py-4'}
            initial={false}
            animate={{ padding: isMinimized ? '8px' : '20px 16px' }}
            transition={contentTransition}
          >
            {/* Grid layout: 3 columns in mini mode, single column in full mode */}
            <div className={`${isMinimized 
              ? 'grid grid-cols-[auto_1fr_auto] items-center gap-3'
              : 'flex flex-col gap-4'
            }`}>
              
              {/* Left Section: Album Art + Track Info */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Album Art */}
                <motion.div
                  className="relative flex-shrink-0 rounded-full overflow-hidden bg-white/8"
                  initial={false}
                  animate={albumArtSize}
                  transition={contentTransition}
                >
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentTrack?.title || 'no-track'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={elementTransition}
                      className="absolute inset-0"
                    >
                      {/* Skeleton loader - show during loading or transition */}
                      {(isAlbumArtLoading || isAlbumArtTransitioning) && !albumArtUrl && (
                        <motion.div 
                          className="absolute inset-0 bg-white/5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            style={{
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 1.5s infinite linear',
                            }}
                          />
                        </motion.div>
                      )}
                      
                      <AnimatePresence mode="popLayout">
                        {albumArtUrl && !albumArtError ? (
                          <motion.img 
                            key={albumArtUrl}
                            src={albumArtUrl} 
                            alt="Album art" 
                            className="absolute inset-0 w-full h-full object-cover rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease }}
                          />
                        ) : !isAlbumArtLoading && (
                          <motion.div 
                            key="placeholder"
                            className="absolute inset-0 w-full h-full flex items-center justify-center bg-white/5 rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="w-5 h-5 rounded-full bg-white/20" />
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={`${currentTrack?.title}-${currentTrack?.artist}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={elementTransition}
                    >
                      <motion.div
                        className="origin-left"
                        initial={false}
                        animate={{ 
                          scale: isMinimized ? 1 : 1.125,
                        }}
                        transition={contentTransition}
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
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={elementTransition}
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
              <AnimatePresence mode="popLayout">
                {isMinimized && (
                  <motion.div
                    key="mini-controls"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ ...elementTransition, delay: stagger }}
                    className="hidden sm:flex items-center justify-center"
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Section: Volume + Speaker Badge */}
              <AnimatePresence mode="popLayout">
                {isMinimized && (
                  <motion.div
                    key="mini-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ ...elementTransition, delay: stagger * 2 }}
                    className="flex items-center gap-3 justify-end pr-1"
                  >
                    <div className="hidden lg:block" onClick={(e) => e.stopPropagation()}>
                      <VolumeControl
                        volume={playerState.volume}
                        isMuted={playerState.isMuted}
                        onVolumeChange={handleVolumeChange}
                        onMuteToggle={handleMuteToggle}
                        compact={true}
                      />
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <MiniSpeakerBadge
                        ref={speakerBadgeRef}
                        playbackTarget={currentPlaybackTarget}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpeakerPopoverOpen(true);
                        }}
                        compact={true}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Full Player Controls */}
            <AnimatePresence mode="popLayout">
              {!isMinimized && (
                <motion.div
                  key="full-controls"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={elementTransition}
                  className="space-y-4 pt-4 overflow-hidden"
                >
                  {/* Source Indicator */}
                  <motion.div 
                    className="flex justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...elementTransition, delay: stagger }}
                  >
                    <SourceIndicator appName={playerState.appName} />
                  </motion.div>

                   {/* Progress Bar */}
                  {currentTrack && (
                    <motion.div 
                      className="pt-1" 
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ ...elementTransition, delay: stagger * 2 }}
                    >
                      <ProgressBar
                        position={currentTrack.position}
                        duration={currentTrack.duration}
                        isLoading={playerState.isTrackLoading}
                        isTransitioning={playerState.isTrackTransitioning}
                        onSeek={handleSeek}
                      />
                    </motion.div>
                  )}

                   {/* Bottom Row: Playback Controls + Volume + Speaker Selector */}
                  <motion.div 
                    className="flex items-center justify-between gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...elementTransition, delay: stagger * 3 }}
                  >
                    <div className="flex-1 flex justify-center" onClick={(e) => e.stopPropagation()}>
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
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Speaker Popover */}
      <SpeakerPopover
        isOpen={speakerPopoverOpen}
        onClose={() => setSpeakerPopoverOpen(false)}
        currentPlaybackTarget={currentPlaybackTarget}
        spotifySources={playerState.availableSources}
        availableSpeakers={availableSpeakers as any}
        predefinedGroups={predefinedGroups}
        onSpotifySourceSelect={handleSpotifySourceChange}
        onSpeakerSelect={handleSpeakerSelect}
        onGroupSelect={handleGroupSelect}
        anchorRef={speakerBadgeRef}
      />
    </>
  );
};
