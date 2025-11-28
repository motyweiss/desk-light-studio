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
}: PlaybackControlsProps) => {
  const getRepeatIcon = () => {
    if (repeat === 'one') return Repeat1;
    return Repeat;
  };

  const RepeatIcon = getRepeatIcon();

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Shuffle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onShuffleToggle}
        className={`transition-colors ${
          shuffle ? 'text-[hsl(44_85%_58%)]' : 'text-white/40 hover:text-white/60'
        }`}
      >
        <Shuffle className="w-4 h-4" />
      </motion.button>

      {/* Previous */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPrevious}
        className="text-white/60 hover:text-white transition-colors"
      >
        <SkipBack className="w-5 h-5" />
      </motion.button>

      {/* Play/Pause */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPlayPause}
        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors backdrop-blur-xl"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" fill="currentColor" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
        )}
      </motion.button>

      {/* Next */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="text-white/60 hover:text-white transition-colors"
      >
        <SkipForward className="w-5 h-5" />
      </motion.button>

      {/* Repeat */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRepeatToggle}
        className={`transition-colors ${
          repeat !== 'off' ? 'text-[hsl(44_85%_58%)]' : 'text-white/40 hover:text-white/60'
        }`}
      >
        <RepeatIcon className="w-4 h-4" />
      </motion.button>
    </div>
  );
};
