import { motion } from "framer-motion";
import { useCallback, useState, useEffect } from "react";
import { BACKGROUND_ANIMATION } from "../constants";
import { PAGE_LOAD } from "@/constants/animations";

interface WarmthLayerProps {
  cssColor: string;
  warmth: number;
  isReady: boolean;
  dataReady: boolean;
}

/**
 * Layer 2: Dynamic warmth color
 * Responds to combined light intensity with smooth transitions
 */
export const WarmthLayer = ({ cssColor, warmth, isReady, dataReady }: WarmthLayerProps) => {
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  
  // Wait for initial load sequence before allowing light-based transitions
  useEffect(() => {
    if (isReady && dataReady && !hasAnimatedIn) {
      const timer = setTimeout(() => {
        setHasAnimatedIn(true);
      }, PAGE_LOAD.effects.glowLayers.delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isReady, dataReady, hasAnimatedIn]);

  const getTransition = useCallback(() => {
    if (!hasAnimatedIn) {
      return {
        duration: BACKGROUND_ANIMATION.initial.duration,
        ease: BACKGROUND_ANIMATION.initial.ease,
      };
    }
    // Use light on/off timing based on warmth direction
    return warmth > 0.1
      ? BACKGROUND_ANIMATION.warmth.on
      : BACKGROUND_ANIMATION.warmth.off;
  }, [hasAnimatedIn, warmth]);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: isReady ? 1 : 0,
        backgroundColor: cssColor,
      }}
      transition={getTransition()}
      style={{
        willChange: 'background-color, opacity',
      }}
    />
  );
};
