import { Speaker, Smartphone, Users, Tv } from 'lucide-react';
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
      
      // Always show full group name
      if (playbackTarget.type === 'group') {
        return playbackTarget.name;
      }
      
      if (playbackTarget.type === 'speaker' && playbackTarget.entityIds.length > 1) {
        return `${playbackTarget.entityIds.length} speakers`;
      }
      
      return playbackTarget.name;
    }, [playbackTarget]);

    const Icon = useMemo(() => {
      if (!playbackTarget) return Speaker;
      if (playbackTarget.type === 'group') {
        // Use Speaker icon for Sonos, TV icon if group name contains TV
        const isSonos = playbackTarget.name.toLowerCase().includes('sonos');
        const isTV = playbackTarget.name.toLowerCase().includes('tv');
        return isSonos ? Speaker : isTV ? Tv : Users;
      }
      if (playbackTarget.type === 'speaker') return Speaker;
      return Smartphone; // Spotify Connect
    }, [playbackTarget]);

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        type="button"
        className={`flex items-center gap-2 rounded-full border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all relative z-10 ${
          compact 
            ? 'px-3 py-1.5 sm:px-4 sm:py-2' 
            : 'px-4 py-2'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className={compact ? "w-4 h-4 text-white/60" : "w-4 h-4 text-white/60"} />
        <span className={`font-light text-white/80 whitespace-nowrap ${
          compact 
            ? 'text-xs sm:text-sm' 
            : 'text-sm'
        }`}>
          {displayText}
        </span>
      </motion.button>
    );
  }
);

MiniSpeakerBadge.displayName = 'MiniSpeakerBadge';