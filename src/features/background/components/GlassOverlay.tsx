import { motion } from "framer-motion";
import { BACKGROUND_ANIMATION, GLASS_EFFECT, GRADIENTS } from "../constants";

interface GlassOverlayProps {
  isReady: boolean;
}

/**
 * Layer 3: Subtle frosted glass effect
 * Very gentle - adds slight texture without overwhelming
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
            hsl(35 14% 56% / ${GRADIENTS.glass.startOpacity}) 0%,
            transparent 35%,
            transparent 65%,
            hsl(35 14% 48% / ${GRADIENTS.glass.endOpacity}) 100%
          )
        `,
        willChange: 'opacity',
      }}
    >
      {/* Very subtle noise texture simulation */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, hsl(36 16% 55% / 0.02) 0%, transparent 30%),
            radial-gradient(circle at 70% 80%, hsl(34 14% 52% / 0.02) 0%, transparent 30%),
            radial-gradient(circle at 50% 50%, hsl(35 15% 53% / 0.01) 0%, transparent 40%)
          `,
          opacity: GLASS_EFFECT.noiseOpacity * 10,
        }}
        animate={{
          opacity: [
            GLASS_EFFECT.noiseOpacity * 8,
            GLASS_EFFECT.noiseOpacity * 12,
            GLASS_EFFECT.noiseOpacity * 8,
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
