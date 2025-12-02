import { Slider } from '@/components/ui/slider';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  position: number;
  duration: number;
  isLoading?: boolean;
  isTransitioning?: boolean;
  onSeek?: (position: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const ProgressBar = ({ position, duration, isLoading, isTransitioning, onSeek }: ProgressBarProps) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(position);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const prevDurationRef = useRef(duration);

  // Handle track transitions smoothly
  useEffect(() => {
    if (duration !== prevDurationRef.current && duration > 0) {
      // New track loaded
      prevDurationRef.current = duration;
      if (!isSeeking) {
        setSeekPosition(position);
      }
    } else if (!isSeeking) {
      setSeekPosition(position);
    }
  }, [position, duration, isSeeking]);

  const displayPosition = isSeeking ? seekPosition : position;
  const percentage = duration > 0 ? (displayPosition / duration) * 100 : 0;

  const handleValueChange = (values: number[]) => {
    const newPosition = (values[0] / 100) * duration;
    setIsSeeking(true);
    setSeekPosition(newPosition);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onSeek && duration > 0) {
        onSeek(newPosition);
      }
      setIsSeeking(false);
    }, 300);
  };

  return (
    <div className="w-full relative">
      {/* Loading/Transition Overlay */}
      <AnimatePresence>
        {(isLoading || isTransitioning) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg z-10"
          >
            <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ 
          opacity: (isLoading || isTransitioning) ? 0.3 : 1 
        }}
        transition={{ duration: 0.3 }}
      >
        <Slider
          value={[percentage]}
          max={100}
          step={0.1}
          onValueChange={handleValueChange}
          className="w-full"
          disabled={isLoading || isTransitioning}
        />
        <div className="flex justify-between mt-2 text-xs text-white/50 font-light tabular-nums tracking-wide">
          <span>{formatTime(displayPosition)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </motion.div>
    </div>
  );
};
