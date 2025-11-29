import { Speaker, Smartphone, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { forwardRef, useMemo } from 'react';
import type { PlaybackTarget } from '@/types/mediaPlayer';

interface MiniSpeakerBadgeProps {
  playbackTarget: PlaybackTarget | null;
  onClick: (e: React.MouseEvent) => void;
  compact?: boolean;
}

export const MiniSpeakerBadge = forwardRef<HTMLButtonElement, MiniSpeakerBadgeProps>(
  ({ playbackTarget, onClick, compact = false }, ref) => {
    const displayText = useMemo(() => {
      if (!playbackTarget) return 'Select Speaker';
      
      if (playbackTarget.type === 'group') {
        return `${playbackTarget.name}`;
      }
      
      if (playbackTarget.type === 'speaker' && playbackTarget.entityIds.length > 1) {
        return `${playbackTarget.entityIds.length} speakers`;
      }
      
      return playbackTarget.name;
    }, [playbackTarget]);

    const Icon = useMemo(() => {
      if (!playbackTarget) return Speaker;
      if (playbackTarget.type === 'group') return Users;
      if (playbackTarget.type === 'speaker') return Speaker;
      return Smartphone; // Spotify Connect
    }, [playbackTarget]);

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        className={`flex items-center gap-2 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all ${
          compact 
            ? 'px-2 py-1 bg-white/5' 
            : 'px-3 py-1.5 bg-white/5'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon className={compact ? "w-3 h-3 text-white/50" : "w-3.5 h-3.5 text-white/50"} />
        <span className={`font-light text-white/70 truncate ${
          compact 
            ? 'text-[10px] max-w-[80px] sm:text-xs sm:max-w-[100px]' 
            : 'text-xs max-w-[120px]'
        }`}>
          {displayText}
        </span>
      </motion.button>
    );
  }
);

MiniSpeakerBadge.displayName = 'MiniSpeakerBadge';