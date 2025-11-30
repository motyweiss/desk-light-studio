import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlaybackControlsProps {
  isPlaying: boolean;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  compact?: boolean;
}

export const PlaybackControls = ({
  isPlaying,
  shuffle,
  repeat,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffleToggle,
  onRepeatToggle,
  compact = false
}: PlaybackControlsProps) => {
  const getRepeatIcon = () => {
    if (repeat === 'one') return Repeat1;
    return Repeat;
  };

  const RepeatIcon = getRepeatIcon();

  return (
    <div className={`flex items-center justify-center ${compact ? 'gap-2 sm:gap-3' : 'gap-4 sm:gap-6'}`}>
      {/* Shuffle - hidden in compact mode */}
      {!compact && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShuffleToggle}
          className={`transition-colors ${
            shuffle ? 'text-[hsl(44_85%_58%)]' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </motion.button>
      )}

      {/* Previous */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPrevious}
        className="text-white/60 hover:text-white transition-colors"
      >
        <SkipBack className={compact ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} fill="currentColor" />
      </motion.button>

      {/* Play/Pause */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPlayPause}
        className={`bg-white/10 hover:bg-white/15 rounded-full transition-colors backdrop-blur-xl ${
          compact ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12'
        } flex items-center justify-center flex-shrink-0`}
      >
        {isPlaying ? (
          <Pause className={compact ? "w-4 h-4 text-white" : "w-4 h-4 sm:w-5 sm:h-5 text-white"} fill="currentColor" />
        ) : (
          <Play className={compact ? "w-4 h-4 text-white ml-0.5" : "w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5"} fill="currentColor" />
        )}
      </motion.button>

      {/* Next */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="text-white/60 hover:text-white transition-colors"
      >
        <SkipForward className={compact ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} fill="currentColor" />
      </motion.button>

      {/* Repeat - hidden in compact mode */}
      {!compact && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRepeatToggle}
          className={`transition-colors ${
            repeat !== 'off' ? 'text-[hsl(44_85%_58%)]' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <RepeatIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </motion.button>
      )}
    </div>
  );
};
