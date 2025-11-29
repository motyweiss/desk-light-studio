import { Speaker } from 'lucide-react';
import { motion } from 'framer-motion';

interface MiniSpeakerBadgeProps {
  speakerName: string;
  onClick: (e: React.MouseEvent) => void;
}

export const MiniSpeakerBadge = ({ speakerName, onClick }: MiniSpeakerBadgeProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Speaker className="w-3.5 h-3.5 text-white/50" />
      <span className="text-xs text-white/70 font-light max-w-[120px] truncate">
        {speakerName}
      </span>
    </motion.button>
  );
};