import { useMemo } from 'react';
import type { Transition } from 'framer-motion';
import { TIMING, EASE, STAGGER, TRANSITIONS } from '@/lib/animations';
import { useReducedMotion } from './useReducedMotion';

interface UseMediaPlayerAnimationsOptions {
  isMinimized: boolean;
  isVisible: boolean;
}

interface MediaPlayerAnimations {
  // Core transitions
  layoutTransition: Transition;
  fadeTransition: Transition;
  entryTransition: Transition;
  modeTransition: Transition;
  
  // Stagger utility
  staggerProps: (index: number) => {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number };
    exit: { opacity: number; y: number };
    transition: Transition;
  };
  
  // Entry animation props
  entryProps: {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number };
    transition: Transition;
  };
  
  // Hover/tap props
  hoverProps: {
    scale: number;
    transition: Transition;
  };
  tapProps: {
    scale: number;
  };
}

export const useMediaPlayerAnimations = ({
  isMinimized,
  isVisible,
}: UseMediaPlayerAnimationsOptions): MediaPlayerAnimations => {
  const reducedMotion = useReducedMotion();
  
  const animations = useMemo(() => {
    const durationMultiplier = reducedMotion ? 0 : 1;
    
    // Layout transition - smooth tween for size/position changes (no bounce)
    const layoutTransition: Transition = {
      duration: TIMING.medium * durationMultiplier,
      ease: EASE.snappy,
    };
    
    // Fade transition - for opacity changes
    const fadeTransition: Transition = {
      duration: TIMING.fast * durationMultiplier,
      ease: EASE.smooth,
    };
    
    // Entry transition - initial page load
    const entryTransition: Transition = {
      duration: TIMING.medium * durationMultiplier,
      delay: 0.2,
      ease: EASE.entrance,
    };
    
    // Mode transition - minimized/expanded switch
    const modeTransition: Transition = {
      duration: TIMING.medium * durationMultiplier,
      ease: EASE.snappy,
    };
    
    // Stagger props generator
    const staggerProps = (index: number) => ({
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -4 },
      transition: {
        duration: TIMING.fast * durationMultiplier,
        delay: index * STAGGER.tight,
        ease: EASE.out,
      },
    });
    
    // Entry props - for initial appearance
    const entryProps = {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: entryTransition,
    };
    
    // Hover props
    const hoverProps = {
      scale: 1.02,
      transition: {
        duration: TIMING.micro * durationMultiplier,
        ease: EASE.smooth,
      },
    };
    
    // Tap props
    const tapProps = {
      scale: 0.98,
    };
    
    return {
      layoutTransition,
      fadeTransition,
      entryTransition,
      modeTransition,
      staggerProps,
      entryProps,
      hoverProps,
      tapProps,
    };
  }, [reducedMotion]);
  
  return animations;
};

// Export static values for use outside of React components
export const PLAYER_TRANSITIONS = {
  layout: TRANSITIONS.layout,
  fade: TRANSITIONS.fade,
  entry: TRANSITIONS.entrance,
  mode: TRANSITIONS.standard,
  stagger: { interval: STAGGER.tight },
  interaction: { hoverScale: 1.02, tapScale: 0.98, duration: TIMING.micro },
  popover: {
    duration: TIMING.fast,
    ease: EASE.out,
    y: 8,
    scale: 0.95,
  },
} as const;
