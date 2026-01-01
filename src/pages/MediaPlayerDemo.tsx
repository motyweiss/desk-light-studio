import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ProgressBar } from '@/components/MediaPlayer/ProgressBar';
import { PlaybackControls } from '@/components/MediaPlayer/PlaybackControls';
import { VolumeControl } from '@/components/MediaPlayer/VolumeControl';
import { SourceIndicator } from '@/components/MediaPlayer/SourceIndicator';
import { AudioVisualizer } from '@/components/MediaPlayer/AudioVisualizer';
import { MusicParticles } from '@/components/MediaPlayer/MusicParticles';

// Demo track data
const DEMO_TRACK = {
  title: "Bohemian Rhapsody",
  artist: "Queen",
  album: "A Night at the Opera",
  duration: 354,
  position: 127,
};

// Animation configuration
const ANIM = {
  container: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      scale: { type: 'spring' as const, stiffness: 200, damping: 20 },
    },
  },
  content: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// Spring for layout changes
const SPRING = {
  layout: { type: 'spring', stiffness: 300, damping: 22, mass: 0.9 },
  content: { type: 'spring', stiffness: 350, damping: 35, mass: 0.8 },
} as const;

const CONTAINER_HEIGHTS = {
  minimized: 64,
  expanded: 240,
} as const;

const MediaPlayerDemo = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(65);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [position, setPosition] = useState(DEMO_TRACK.position);

  const isExpanded = !isMinimized;

  const transitions = useMemo(() => ({
    layout: SPRING.layout,
    content: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1] as const,
      delay: isExpanded ? 0.15 : 0,
    },
  }), [isExpanded]);

  const albumArtSize = useMemo(() => ({
    width: isMinimized ? 48 : 72,
    height: isMinimized ? 48 : 72,
  }), [isMinimized]);

  const paddingStyles = useMemo(() => ({
    paddingLeft: isMinimized ? 8 : 24,
    paddingRight: isMinimized ? 16 : 24,
    paddingTop: isMinimized ? 8 : 20,
    paddingBottom: isMinimized ? 8 : 12,
  }), [isMinimized]);

  const handlePlayPause = () => setIsPlaying(prev => !prev);
  const handleNext = () => console.log('Next');
  const handlePrevious = () => console.log('Previous');
  const handleVolumeChange = (v: number) => setVolume(v);
  const handleMuteToggle = () => setIsMuted(prev => !prev);
  const handleShuffleToggle = () => setShuffle(prev => !prev);
  const handleRepeatToggle = () => {
    setRepeat(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };
  const handleSeek = (pos: number) => setPosition(pos);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-[#A59587]"
    >
      {/* Player Container - expands from center */}
      <motion.div
        initial={ANIM.container.initial}
        animate={ANIM.container.animate}
        transition={ANIM.container.transition}
        className="w-full max-w-2xl"
      >
        <motion.div 
          onClick={() => setIsMinimized(prev => !prev)}
          className="relative cursor-pointer overflow-hidden mx-auto"
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
              ? '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)' 
              : '0 20px 60px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)',
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
            <SourceIndicator appName="Spotify" />
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
              className="flex items-center justify-between h-full"
              initial={false}
              animate={{
                gap: isMinimized ? 12 : 0,
                flexDirection: isMinimized ? 'row' : 'column',
                alignItems: isMinimized ? 'center' : 'stretch',
                minHeight: isMinimized ? 48 : 'auto',
              }}
              transition={transitions.layout}
            >
              {/* Album Art + Track Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1 h-full">
                {/* Album Art */}
                <motion.div
                  className="relative flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-amber-500/30 to-orange-600/30"
                  initial={false}
                  animate={albumArtSize}
                  transition={transitions.layout}
                >
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                    <div className="w-1/3 h-1/3 rounded-full bg-white/15" />
                  </div>
                  <MusicParticles isPlaying={isPlaying} containerSize={albumArtSize} />
                </motion.div>

                {/* Track Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className={`text-white font-medium truncate transition-all duration-300 leading-tight ${isMinimized ? 'text-[13px]' : 'text-lg'}`}>
                    {DEMO_TRACK.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className={`text-white/40 truncate transition-all duration-300 leading-tight ${isMinimized ? 'text-xs' : 'text-sm'}`}>
                      {DEMO_TRACK.artist}
                    </p>
                    {isMinimized && isPlaying && (
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
                      height: transitions.layout,
                      marginTop: transitions.layout,
                      opacity: transitions.content,
                      filter: transitions.content,
                    }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="text-white/35 text-sm truncate">{DEMO_TRACK.album}</p>
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
                  style={{ flexShrink: 0, marginTop: -2 }}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <PlaybackControls
                      isPlaying={isPlaying}
                      shuffle={shuffle}
                      repeat={repeat}
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

            {/* Expanded Controls */}
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
                <div onClick={(e) => e.stopPropagation()}>
                  <ProgressBar
                    position={position}
                    duration={DEMO_TRACK.duration}
                    isLoading={false}
                    isTransitioning={false}
                    onSeek={handleSeek}
                  />
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between">
                  <div className="flex" onClick={(e) => e.stopPropagation()}>
                    <PlaybackControls
                      isPlaying={isPlaying}
                      shuffle={shuffle}
                      repeat={repeat}
                      onPlayPause={handlePlayPause}
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      onShuffleToggle={handleShuffleToggle}
                      onRepeatToggle={handleRepeatToggle}
                    />
                  </div>
                  
                  <div className="flex items-center gap-5" onClick={(e) => e.stopPropagation()}>
                    <VolumeControl
                      volume={volume}
                      isMuted={isMuted}
                      onVolumeChange={handleVolumeChange}
                      onMuteToggle={handleMuteToggle}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MediaPlayerDemo;
