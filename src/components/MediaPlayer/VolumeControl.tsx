import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { PLAYER_TRANSITIONS } from '@/hooks/useMediaPlayerAnimations';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  compact?: boolean;
}

// Unified interaction animation
const interactionTransition = {
  duration: PLAYER_TRANSITIONS.interaction.duration,
  ease: [0.4, 0, 0.2, 1] as const,
};

export const VolumeControl = ({ volume, isMuted, onVolumeChange, onMuteToggle, compact = false }: VolumeControlProps) => {
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const [localVolume, setLocalVolume] = useState(volume);

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const getVolumeIcon = () => {
    if (isMuted || localVolume === 0) return VolumeX;
    if (localVolume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0] / 100;
    
    // Immediate UI update
    setLocalVolume(newVolume);
    
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
    <div className="flex items-center gap-2 sm:gap-3">
      <motion.button
        whileHover={{ scale: PLAYER_TRANSITIONS.interaction.hoverScale }}
        whileTap={{ scale: PLAYER_TRANSITIONS.interaction.tapScale }}
        transition={interactionTransition}
        onClick={onMuteToggle}
        className="text-white/60 hover:text-white transition-colors"
      >
        <VolumeIcon className={compact ? "w-4 h-4" : "w-5 h-5"} />
      </motion.button>
      <div className={compact ? "w-16 sm:w-20" : "w-20 sm:w-24"}>
        <Slider
          value={[isMuted ? 0 : localVolume * 100]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};
