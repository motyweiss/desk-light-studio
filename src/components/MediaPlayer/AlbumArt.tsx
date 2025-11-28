import { Music } from 'lucide-react';
import { motion } from 'framer-motion';

interface AlbumArtProps {
  albumArt: string | null;
  isPlaying: boolean;
}

export const AlbumArt = ({ albumArt, isPlaying }: AlbumArtProps) => {
  return (
    <motion.div
      className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0"
      animate={isPlaying ? {
        boxShadow: [
          '0 0 20px rgba(255, 255, 255, 0.1)',
          '0 0 30px rgba(255, 255, 255, 0.15)',
          '0 0 20px rgba(255, 255, 255, 0.1)',
        ]
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {albumArt ? (
        <img 
          src={albumArt} 
          alt="Album art" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Music className="w-8 h-8 text-white/20" />
        </div>
      )}
    </motion.div>
  );
};
