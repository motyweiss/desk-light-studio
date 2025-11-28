import { Slider } from '@/components/ui/slider';

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
  const percentage = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <div className="space-y-2 w-full">
      <Slider
        value={[percentage]}
        max={100}
        step={0.1}
        onValueChange={(values) => {
          if (onSeek && duration > 0) {
            const newPosition = (values[0] / 100) * duration;
            onSeek(newPosition);
          }
        }}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-white/40 font-light">
        <span>{formatTime(position)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
