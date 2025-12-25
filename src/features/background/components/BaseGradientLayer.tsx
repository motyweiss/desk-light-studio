import { motion } from "framer-motion";
import { BACKGROUND_ANIMATION, GRADIENTS } from "../constants";

interface BaseGradientLayerProps {
  isReady: boolean;
}

/**
 * Layer 1: Static mesh gradient base
 * Provides depth and visual interest without animation overhead
 */
export const BaseGradientLayer = ({ isReady }: BaseGradientLayerProps) => {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: isReady ? 1 : 0 }}
      transition={{
        duration: BACKGROUND_ANIMATION.initial.duration,
        ease: BACKGROUND_ANIMATION.initial.ease,
      }}
      style={{
        background: `
          radial-gradient(
            ellipse 80% 60% at ${GRADIENTS.mesh[0].x}% ${GRADIENTS.mesh[0].y}%,
            hsl(38 22% 58% / ${GRADIENTS.mesh[0].opacity}) 0%,
            transparent 50%
          ),
          radial-gradient(
            ellipse 70% 70% at ${GRADIENTS.mesh[1].x}% ${GRADIENTS.mesh[1].y}%,
            hsl(34 18% 54% / ${GRADIENTS.mesh[1].opacity}) 0%,
            transparent 50%
          ),
          radial-gradient(
            ellipse 90% 80% at ${GRADIENTS.mesh[2].x}% ${GRADIENTS.mesh[2].y}%,
            hsl(36 20% 56% / ${GRADIENTS.mesh[2].opacity}) 0%,
            transparent 60%
          )
        `,
        willChange: 'opacity',
      }}
    />
  );
};
