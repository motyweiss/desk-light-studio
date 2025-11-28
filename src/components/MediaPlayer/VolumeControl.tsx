import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { useRef } from 'react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

export const VolumeControl = ({ volume, isMuted, onVolumeChange, onMuteToggle }: VolumeControlProps) => {
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0] / 100;
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the API call
    debounceTimerRef.current = setTimeout(() => {
      onVolumeChange(newVolume);
    }, 300);
  };

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMuteToggle}
        className="text-white/60 hover:text-white transition-colors"
      >
        <VolumeIcon className="w-5 h-5" />
      </motion.button>
      <div className="w-24">
        <Slider
          value={[isMuted ? 0 : volume * 100]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};
