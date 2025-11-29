import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Music2 } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  delay: number;
}

interface MusicParticlesProps {
  isPlaying: boolean;
  containerSize: { width: number; height: number };
}

export const MusicParticles = ({ isPlaying, containerSize }: MusicParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isPlaying) {
      setParticles([]);
      return;
    }

    // Generate particles periodically
    const interval = setInterval(() => {
      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        x: Math.random() * containerSize.width,
        y: containerSize.height / 2,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.2,
      };

      setParticles((prev) => [...prev.slice(-8), newParticle]); // Keep max 8 particles
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying, containerSize]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 0,
              scale: 0,
              rotate: particle.rotation,
            }}
            animate={{
              y: [particle.y, particle.y - 60, particle.y - 120],
              x: [
                particle.x,
                particle.x + (Math.random() - 0.5) * 30,
                particle.x + (Math.random() - 0.5) * 60,
              ],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0.8],
              rotate: particle.rotation + 180,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            onAnimationComplete={() => {
              setParticles((prev) => prev.filter((p) => p.id !== particle.id));
            }}
            className="absolute"
          >
            <Music2 className="w-4 h-4 text-white/40" strokeWidth={1.5} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
