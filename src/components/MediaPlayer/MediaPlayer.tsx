import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage';
import { useMediaPlayer, useMediaPlayerUI, PLAYER_HEIGHTS } from '@/features/mediaPlayer';
import { useMediaPlayerAnimations } from '@/hooks/useMediaPlayerAnimations';
import { ProgressBar } from './ProgressBar';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControl } from './VolumeControl';
import { SourceIndicator } from './SourceIndicator';
import { MiniSpeakerBadge } from './MiniSpeakerBadge';
import { SpeakerPopover } from './SpeakerPopover';
import { AudioVisualizer } from './AudioVisualizer';
import { MusicParticles } from './MusicParticles';
import { TIMING, EASE } from '@/lib/animations';

// Unified transition for all layout properties - must be identical across all elements
const PLAYER_LAYOUT_TRANSITION = {
  duration: 0.4,
  ease: [0.32, 0.72, 0, 1] as const, // Snappy ease-out
};

// Faster transition for content opacity
const CONTENT_FADE_TRANSITION = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

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

  // Get unified animation system
  const { 
    entryProps,
    staggerProps,
  } = useMediaPlayerAnimations({
    isMinimized,
    isVisible: true,
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

  // Memoize animated values to prevent recalculation
  const containerStyles = useMemo(() => ({
    borderRadius: isMinimized ? 32 : 24,
    maxWidth: isMinimized ? 420 : 672,
    backgroundColor: isMinimized ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.18)',
  }), [isMinimized]);

  const paddingStyles = useMemo(() => ({
    paddingLeft: isMinimized ? 8 : 20,
    paddingRight: isMinimized ? 16 : 20,
    paddingTop: isMinimized ? 8 : 14,
    paddingBottom: isMinimized ? 8 : 14,
  }), [isMinimized]);

  const albumArtSize = useMemo(() => ({
    width: isMinimized ? 48 : 64,
    height: isMinimized ? 48 : 64,
  }), [isMinimized]);

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

  return (
    <>
      <motion.div
        ref={playerRef}
        {...entryProps}
        className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4"
      >
        <motion.div 
          onClick={handleToggleMinimized}
          className="relative cursor-pointer overflow-hidden"
          initial={false}
          animate={containerStyles}
          style={{
            width: '100%',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: isMinimized 
              ? '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)' 
              : '0 12px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          }}
          transition={PLAYER_LAYOUT_TRANSITION}
          whileHover={{ 
            backgroundColor: isMinimized ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.22)',
            transition: { duration: 0.2 }
          }}
        >
          {/* Content Container - animate padding */}
          <motion.div 
            initial={false}
            animate={paddingStyles}
            transition={PLAYER_LAYOUT_TRANSITION}
          >
            {/* Inner content wrapper - always flex, gap changes */}
            <motion.div 
              className="flex items-center"
              initial={false}
              animate={{
                gap: isMinimized ? 12 : 16,
                flexDirection: isMinimized ? 'row' : 'column',
                alignItems: isMinimized ? 'center' : 'stretch',
              }}
              transition={PLAYER_LAYOUT_TRANSITION}
              style={{ display: 'flex' }}
            >
              {/* Left Section: Album Art + Track Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Album Art */}
                <motion.div
                  className="relative flex-shrink-0 rounded-full overflow-hidden bg-white/8"
                  initial={false}
                  animate={albumArtSize}
                  transition={PLAYER_LAYOUT_TRANSITION}
                >
                  <AnimatePresence mode="sync">
                    <motion.div
                      key={currentTrack?.title || 'no-track'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={CONTENT_FADE_TRANSITION}
                      className="absolute inset-0"
                    >
                      {/* Skeleton loader */}
                      {(isAlbumArtLoading || isAlbumArtTransitioning) && !albumArtUrl && (
                        <div className="absolute inset-0 bg-white/5">
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            style={{
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 1.5s infinite linear',
                            }}
                          />
                        </div>
                      )}
                      
                      {albumArtUrl && !albumArtError ? (
                        <img 
                          src={albumArtUrl} 
                          alt="Album art" 
                          className="absolute inset-0 w-full h-full object-cover rounded-full"
                        />
                      ) : !isAlbumArtLoading && (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white/5 rounded-full" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  <MusicParticles 
                    isPlaying={playerState.isPlaying} 
                    containerSize={albumArtSize}
                  />
                </motion.div>

                {/* Track Info */}
                <motion.div
                  className="flex-1 min-w-0"
                  initial={false}
                  animate={{ 
                    scale: isMinimized ? 1 : 1.05,
                    originX: 0,
                  }}
                  transition={PLAYER_LAYOUT_TRANSITION}
                >
                  <h3 className={`text-white font-light truncate ${isMinimized ? 'text-[13px]' : 'text-sm sm:text-base'}`}>
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
                  
                  {/* Album name - Only in full mode */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isMinimized ? 0 : 'auto',
                      opacity: isMinimized ? 0 : 1,
                      marginTop: isMinimized ? 0 : 2,
                    }}
                    transition={CONTENT_FADE_TRANSITION}
                    style={{ overflow: 'hidden' }}
                  >
                    {currentTrack?.album && (
                      <p className="text-white/30 text-xs truncate">
                        {currentTrack.album}
                      </p>
                    )}
                  </motion.div>
                </motion.div>
              </div>

              {/* Mini Controls - slide in/out */}
              <motion.div
                initial={false}
                animate={{
                  width: isMinimized ? 'auto' : 0,
                  opacity: isMinimized ? 1 : 0,
                  x: isMinimized ? 0 : 20,
                }}
                transition={CONTENT_FADE_TRANSITION}
                style={{ overflow: 'hidden', flexShrink: 0 }}
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
            </motion.div>

            {/* Full Player Controls - height animation */}
            <motion.div
              initial={false}
              animate={{
                height: isMinimized ? 0 : 'auto',
                opacity: isMinimized ? 0 : 1,
                marginTop: isMinimized ? 0 : 12,
              }}
              transition={{
                height: PLAYER_LAYOUT_TRANSITION,
                opacity: { ...CONTENT_FADE_TRANSITION, delay: isMinimized ? 0 : 0.1 },
                marginTop: PLAYER_LAYOUT_TRANSITION,
              }}
              style={{ overflow: 'hidden' }}
            >
              <div className="space-y-3">
                {/* Source Indicator */}
                <div className="flex justify-end">
                  <SourceIndicator appName={playerState.appName} />
                </div>

                {/* Progress Bar */}
                {currentTrack && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ProgressBar
                      position={currentTrack.position}
                      duration={currentTrack.duration}
                      isLoading={playerState.isTrackLoading}
                      isTransitioning={playerState.isTrackTransitioning}
                      onSeek={handleSeek}
                    />
                  </div>
                )}

                {/* Bottom Row */}
                <div className="flex items-center justify-between gap-4">
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
                </div>
              </div>
            </motion.div>
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
