import { motion } from "framer-motion";
import { BACKGROUND_ANIMATION, GRADIENTS } from "../constants";

interface BaseGradientLayerProps {
  isReady: boolean;
}

/**
 * Layer 1: Static mesh gradient base
 * Very subtle - provides depth without competing with desk image
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
            ellipse 90% 70% at ${GRADIENTS.mesh[0].x}% ${GRADIENTS.mesh[0].y}%,
            hsl(36 18% 54% / ${GRADIENTS.mesh[0].opacity}) 0%,
            transparent 60%
          ),
          radial-gradient(
            ellipse 80% 80% at ${GRADIENTS.mesh[1].x}% ${GRADIENTS.mesh[1].y}%,
            hsl(34 15% 52% / ${GRADIENTS.mesh[1].opacity}) 0%,
            transparent 55%
          ),
          radial-gradient(
            ellipse 100% 90% at ${GRADIENTS.mesh[2].x}% ${GRADIENTS.mesh[2].y}%,
            hsl(35 16% 53% / ${GRADIENTS.mesh[2].opacity}) 0%,
            transparent 65%
          )
        `,
        willChange: 'opacity',
      }}
    />
  );
};
