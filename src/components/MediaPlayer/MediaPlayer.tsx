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

// ============================================
// UNIFIED ANIMATION SYSTEM
// Perfect synchronization between all elements
// ============================================

const DURATION = {
  layout: 0.45,
  content: 0.28,
} as const;

// All curves end with smooth deceleration (0, 1) for clean finish
const EASE = {
  // Standard smooth ease-out
  layout: [0.22, 1, 0.36, 1] as const,
  // Slightly faster start, smooth end
  content: [0.33, 1, 0.68, 1] as const,
} as const;

const createTransitions = (isExpanding: boolean) => ({
  layout: {
    duration: DURATION.layout,
    ease: EASE.layout,
  },
  content: {
    duration: DURATION.content,
    ease: EASE.content,
    // Small delay when expanding to let layout start first
    delay: isExpanding ? 0.08 : 0,
  },
  // No delay on layoutDelayed - runs in parallel for smooth finish
  layoutDelayed: {
    duration: DURATION.layout,
    ease: EASE.layout,
  },
});

export const MediaPlayer = () => {
  const [isMinimized, setIsMinimizedLocal] = useState(true);
  const [speakerPopoverOpen, setSpeakerPopoverOpen] = useState(false);
  const speakerBadgeRef = useRef<HTMLButtonElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const { setIsMinimized, setIsVisible, setPlayerHeight } = useMediaPlayerUI();

  const {
    playerState,
    isLoading,
    availableSpeakers,
    predefinedGroups,
    currentPlaybackTarget,
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

  const { entryProps } = useMediaPlayerAnimations({
    isMinimized,
    isVisible: true,
  });

  const { 
    imageUrl: albumArtUrl, 
    isLoading: isAlbumArtLoading, 
    error: albumArtError,
    isTransitioning: isAlbumArtTransitioning 
  } = useAuthenticatedImage(
    playerState?.currentTrack?.albumArt || null
  );

  const isPlayerVisible = !isLoading && playerState && 
    !(playerState.isOff && !playerState.currentTrack) &&
    !(playerState.queueEnded && !playerState.isPlaying);

  useEffect(() => {
    setIsVisible(isPlayerVisible);
    if (isPlayerVisible) {
      setPlayerHeight(isMinimized ? PLAYER_HEIGHTS.minimized : PLAYER_HEIGHTS.expanded);
    }
  }, [isPlayerVisible, isMinimized, setIsVisible, setPlayerHeight]);

  useEffect(() => {
    setIsMinimized(isMinimized);
  }, [isMinimized, setIsMinimized]);

  const handleToggleMinimized = () => {
    setIsMinimizedLocal(prev => !prev);
  };

  // Derived state
  const isExpanded = !isMinimized;
  
  // Get transitions for current direction
  const transitions = useMemo(() => createTransitions(isExpanded), [isExpanded]);

  // Memoized styles
  const containerStyles = useMemo(() => ({
    borderRadius: isMinimized ? 32 : 24,
    maxWidth: isMinimized ? 420 : 672,
    backgroundColor: isMinimized ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.18)',
  }), [isMinimized]);

  const paddingStyles = useMemo(() => ({
    paddingLeft: isMinimized ? 8 : 24,
    paddingRight: isMinimized ? 16 : 24,
    paddingTop: isMinimized ? 8 : 20,
    paddingBottom: isMinimized ? 8 : 20,
  }), [isMinimized]);

  const albumArtSize = useMemo(() => ({
    width: isMinimized ? 48 : 80,
    height: isMinimized ? 48 : 80,
  }), [isMinimized]);

  if (isLoading || !playerState) return null;
  if (playerState.isOff && !playerState.currentTrack) return null;
  if (playerState.queueEnded && !playerState.isPlaying) return null;

  const currentTrack = playerState.currentTrack;

  return (
    <>
      <motion.div
        ref={playerRef}
        {...entryProps}
        className="fixed bottom-6 md:bottom-8 left-0 right-0 z-50 flex justify-center px-4"
      >
        <motion.div 
          onClick={handleToggleMinimized}
          className="relative cursor-pointer"
          initial={false}
          animate={containerStyles}
          transition={transitions.layout}
          style={{
            width: '100%',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: isMinimized 
              ? '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)' 
              : '0 12px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          }}
          whileHover={{ 
            backgroundColor: isMinimized ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.22)',
            transition: { duration: 0.15 }
          }}
        >
          {/* Source Indicator - expanded only */}
          <motion.div
            initial={false}
            animate={{
              opacity: isExpanded ? 1 : 0,
              scale: isExpanded ? 1 : 0.85,
              filter: isExpanded ? 'blur(0px)' : 'blur(6px)',
            }}
            transition={transitions.content}
            className="absolute z-10"
            style={{ top: 16, right: 20, pointerEvents: isExpanded ? 'auto' : 'none' }}
          >
            <SourceIndicator appName={playerState.appName} />
          </motion.div>

          {/* Content Container */}
          <motion.div 
            initial={false}
            animate={paddingStyles}
            transition={transitions.layout}
            className="relative"
          >
            {/* Main content row */}
            <motion.div 
              className="flex items-center"
              initial={false}
              animate={{
                gap: 12,
                flexDirection: isMinimized ? 'row' : 'column',
                alignItems: isMinimized ? 'center' : 'stretch',
              }}
              transition={transitions.layout}
            >
              {/* Album Art + Track Info */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Album Art */}
                <motion.div
                  className="relative flex-shrink-0 rounded-full overflow-hidden bg-white/8"
                  initial={false}
                  animate={albumArtSize}
                  transition={transitions.layout}
                >
                  <AnimatePresence mode="sync">
                    <motion.div
                      key={currentTrack?.title || 'no-track'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE.content }}
                      className="absolute inset-0"
                    >
                      {(isAlbumArtLoading || isAlbumArtTransitioning) && !albumArtUrl && (
                        <div className="absolute inset-0 bg-white/5">
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }}
                          />
                        </div>
                      )}
                      
                      {albumArtUrl && !albumArtError ? (
                        <img src={albumArtUrl} alt="Album art" className="absolute inset-0 w-full h-full object-cover rounded-full" />
                      ) : !isAlbumArtLoading && (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white/5 rounded-full" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  <MusicParticles isPlaying={playerState.isPlaying} containerSize={albumArtSize} />
                </motion.div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-white font-medium truncate transition-all duration-300 ${isMinimized ? 'text-[13px]' : 'text-lg'}`}>
                    {currentTrack?.title || 'No media playing'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className={`text-white/50 truncate transition-all duration-300 ${isMinimized ? 'text-xs' : 'text-sm'}`}>
                      {currentTrack?.artist || 'Unknown Artist'}
                    </p>
                    {isMinimized && playerState.isPlaying && (
                      <AudioVisualizer isPlaying={true} barCount={3} />
                    )}
                  </div>
                  
                  {/* Album name - expanded only */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0,
                      marginTop: isExpanded ? 2 : 0,
                      filter: isExpanded ? 'blur(0px)' : 'blur(4px)',
                    }}
                    transition={{
                      height: transitions.layoutDelayed,
                      marginTop: transitions.layoutDelayed,
                      opacity: transitions.content,
                      filter: transitions.content,
                    }}
                    style={{ overflow: 'hidden' }}
                  >
                    {currentTrack?.album && (
                      <p className="text-white/35 text-sm truncate">{currentTrack.album}</p>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Mini Controls - minimized only */}
              <motion.div
                initial={false}
                animate={{
                  width: isMinimized ? 'auto' : 0,
                  opacity: isMinimized ? 1 : 0,
                  scale: isMinimized ? 1 : 0.9,
                  filter: isMinimized ? 'blur(0px)' : 'blur(6px)',
                }}
                transition={{
                  width: transitions.layoutDelayed,
                  opacity: createTransitions(isMinimized).content,
                  scale: createTransitions(isMinimized).content,
                  filter: createTransitions(isMinimized).content,
                }}
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

            {/* Expanded Controls */}
            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? 'auto' : 0,
                opacity: isExpanded ? 1 : 0,
                marginTop: isExpanded ? 16 : 0,
                scale: isExpanded ? 1 : 0.95,
                filter: isExpanded ? 'blur(0px)' : 'blur(6px)',
              }}
              transition={{
                height: transitions.layoutDelayed,
                marginTop: transitions.layoutDelayed,
                opacity: transitions.content,
                scale: transitions.content,
                filter: transitions.content,
              }}
              style={{ 
                overflow: isExpanded ? 'visible' : 'hidden',
                transformOrigin: 'top center',
              }}
            >
              <div className="space-y-4">
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
