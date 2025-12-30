import { Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage';

interface AlbumArtProps {
  albumArt: string | null;
  isPlaying: boolean;
}

export const AlbumArt = ({ albumArt, isPlaying }: AlbumArtProps) => {
  const { imageUrl, isLoading, error } = useAuthenticatedImage(albumArt);

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
      {isLoading ? (
        <div className="w-full h-full bg-white/5 animate-pulse" />
      ) : imageUrl && !error ? (
        <img 
          src={imageUrl} 
          alt="Album art" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/8 to-white/4">
          <div className="w-6 h-6 rounded-full bg-white/10" />
        </div>
      )}
    </motion.div>
  );
};
