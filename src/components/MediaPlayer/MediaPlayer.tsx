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
// Container grows organically, content fades in after
// ============================================

// Fixed heights for organic growth animation
const CONTAINER_HEIGHTS = {
  minimized: 64,
  expanded: 240,
} as const;

// Spring-based animation for smooth, natural motion
const SPRING = {
  // Soft spring with subtle bounce for container morphing
  layout: { type: 'spring', stiffness: 300, damping: 22, mass: 0.9 },
  // Slightly stiffer for content
  content: { type: 'spring', stiffness: 350, damping: 35, mass: 0.8 },
} as const;

const DURATION = {
  content: 0.25,
} as const;

const EASE = {
  content: [0.4, 0, 0.2, 1] as const,
} as const;

const createTransitions = (isExpanding: boolean) => ({
  // Spring for smooth container morphing
  layout: SPRING.layout,
  // Content with delay when expanding (appears after container starts growing)
  content: {
    duration: DURATION.content,
    ease: EASE.content,
    delay: isExpanding ? 0.15 : 0,
  },
  // For internal layout changes
  layoutDelayed: SPRING.layout,
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

  // Memoized styles - container grows with fixed height values
  const containerStyles = useMemo(() => ({
    height: isMinimized ? CONTAINER_HEIGHTS.minimized : CONTAINER_HEIGHTS.expanded,
    borderRadius: isMinimized ? 9999 : 24,
    maxWidth: isMinimized ? 420 : 672,
    backgroundColor: isMinimized ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.18)',
  }), [isMinimized]);

  const paddingStyles = useMemo(() => ({
    paddingLeft: isMinimized ? 10 : 24,
    paddingRight: isMinimized ? 10 : 24,
    paddingTop: isMinimized ? 8 : 20,
    paddingBottom: isMinimized ? 8 : 12,
  }), [isMinimized]);

  const albumArtSize = useMemo(() => ({
    width: isMinimized ? 48 : 72,
    height: isMinimized ? 48 : 72,
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
        className="fixed bottom-6 md:bottom-8 left-0 right-0 z-50 flex justify-center items-end px-4"
      >
        <motion.div 
          onClick={handleToggleMinimized}
          className="relative cursor-pointer overflow-hidden"
          layout
          initial={false}
          animate={{
            height: isMinimized ? CONTAINER_HEIGHTS.minimized : CONTAINER_HEIGHTS.expanded,
            borderRadius: isMinimized ? 32 : 24,
            maxWidth: isMinimized ? 420 : 672,
            backgroundColor: isMinimized ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.18)',
          }}
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
              <div className="flex items-center gap-3 min-w-0 flex-1">
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
              {isMinimized && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={transitions.content}
                  style={{ flexShrink: 0 }}
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
            </motion.div>

            {/* Expanded Controls - fade in after container grows */}
            <motion.div
              initial={false}
              animate={{
                opacity: isExpanded ? 1 : 0,
                y: isExpanded ? 0 : -8,
                pointerEvents: isExpanded ? 'auto' : 'none',
              }}
              transition={transitions.content}
              className="mt-8"
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

                {/* Bottom Row - Controls left, Volume & Speaker on right */}
                <div className="flex items-center justify-between">
                  {/* Left-aligned Playback Controls */}
                  <div className="flex" onClick={(e) => e.stopPropagation()}>
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
                  
                  {/* Right side - Volume & Speaker */}
                  <div className="flex items-center gap-5" onClick={(e) => e.stopPropagation()}>
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
