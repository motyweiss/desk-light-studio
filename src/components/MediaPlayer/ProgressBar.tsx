import { Slider } from '@/components/ui/slider';
import { useState, useEffect, useRef } from 'react';

interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek?: (position: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const ProgressBar = ({ position, duration, onSeek }: ProgressBarProps) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(position);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isSeeking) {
      setSeekPosition(position);
    }
  }, [position, isSeeking]);

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
    <div className="space-y-2 w-full">
      <Slider
        value={[percentage]}
        max={100}
        step={0.1}
        onValueChange={handleValueChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-white/40 font-light">
        <span>{formatTime(displayPosition)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
