import { Speaker } from 'lucide-react';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

interface MiniSpeakerBadgeProps {
  speakerName: string;
  groupMembers?: string[];
  isGroup?: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const MiniSpeakerBadge = forwardRef<HTMLButtonElement, MiniSpeakerBadgeProps>(
  ({ speakerName, groupMembers, isGroup, onClick }, ref) => {
    const displayText = isGroup && groupMembers && groupMembers.length > 1
      ? `${groupMembers.length} speakers`
      : speakerName;

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Speaker className="w-3.5 h-3.5 text-white/50" />
        <span className="text-xs text-white/70 font-light max-w-[120px] truncate">
          {displayText}
        </span>
      </motion.button>
    );
  }
);

MiniSpeakerBadge.displayName = 'MiniSpeakerBadge';