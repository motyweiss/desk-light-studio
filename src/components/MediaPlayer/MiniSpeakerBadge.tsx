import { Speaker, Smartphone, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { forwardRef, useMemo } from 'react';
import type { PlaybackTarget } from '@/types/mediaPlayer';

interface MiniSpeakerBadgeProps {
  playbackTarget: PlaybackTarget | null;
  onClick: (e: React.MouseEvent) => void;
}

export const MiniSpeakerBadge = forwardRef<HTMLButtonElement, MiniSpeakerBadgeProps>(
  ({ playbackTarget, onClick }, ref) => {
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon className="w-3.5 h-3.5 text-white/50" />
        <span className="text-xs text-white/70 font-light max-w-[120px] truncate">
          {displayText}
        </span>
      </motion.button>
    );
  }
);

MiniSpeakerBadge.displayName = 'MiniSpeakerBadge';