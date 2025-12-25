import { motion } from "framer-motion";
import { BACKGROUND_ANIMATION, GLASS_EFFECT, GRADIENTS } from "../constants";

interface GlassOverlayProps {
  isReady: boolean;
}

/**
 * Layer 3: Frosted glass effect
 * Adds subtle texture and depth with noise-like pattern
 */
export const GlassOverlay = ({ isReady }: GlassOverlayProps) => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isReady ? 1 : 0 }}
      transition={{
        duration: BACKGROUND_ANIMATION.initial.duration,
        ease: BACKGROUND_ANIMATION.initial.ease,
        delay: 0.1,
      }}
      style={{
        background: `
          linear-gradient(
            180deg,
            hsl(35 15% 60% / ${GRADIENTS.glass.startOpacity}) 0%,
            transparent 40%,
            transparent 60%,
            hsl(35 15% 45% / ${GRADIENTS.glass.endOpacity}) 100%
          )
        `,
        willChange: 'opacity',
      }}
    >
      {/* Subtle noise texture simulation with micro-gradients */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, hsl(40 20% 60% / 0.04) 0%, transparent 25%),
            radial-gradient(circle at 75% 75%, hsl(30 15% 55% / 0.03) 0%, transparent 25%),
            radial-gradient(circle at 50% 10%, hsl(38 18% 58% / 0.03) 0%, transparent 30%),
            radial-gradient(circle at 10% 80%, hsl(35 16% 52% / 0.03) 0%, transparent 25%),
            radial-gradient(circle at 90% 30%, hsl(36 17% 54% / 0.03) 0%, transparent 25%)
          `,
          opacity: GLASS_EFFECT.noiseOpacity * 10,
        }}
        animate={{
          opacity: [
            GLASS_EFFECT.noiseOpacity * 10,
            GLASS_EFFECT.noiseOpacity * 12,
            GLASS_EFFECT.noiseOpacity * 10,
          ],
        }}
        transition={{
          duration: BACKGROUND_ANIMATION.shimmer.duration,
          repeat: Infinity,
          ease: BACKGROUND_ANIMATION.shimmer.ease,
        }}
      />
    </motion.div>
  );
};
