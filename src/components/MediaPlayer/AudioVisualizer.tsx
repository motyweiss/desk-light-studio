import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export const AudioVisualizer = ({ isPlaying, barCount = 4, className = '' }: AudioVisualizerProps) => {
  const bars = useMemo(() => Array.from({ length: barCount }, (_, i) => i), [barCount]);
  
  return (
    <div className={`flex items-center gap-1 h-5 ${className}`}>
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-white/60 rounded-full"
          initial={{ height: '20%' }}
          animate={isPlaying ? {
            height: ['20%', '100%', '30%', '80%', '40%', '20%'],
            opacity: [0.6, 0.9, 0.7, 0.95, 0.65, 0.6],
          } : {
            height: '20%',
            opacity: 0.3,
          }}
          transition={{
            duration: 1.2 + (i * 0.15),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};
