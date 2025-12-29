import { useMemo } from 'react';
import { MEDIA_PLAYER } from '@/constants/animations';
import type { Transition, Variants } from 'framer-motion';

interface UseMediaPlayerAnimationsOptions {
  isMinimized: boolean;
  isVisible: boolean;
  reducedMotion?: boolean;
}

interface MediaPlayerAnimations {
  // Transitions
  containerTransition: Transition;
  contentTransition: Transition;
  entryTransition: Transition;
  interactionTransition: Transition;
  
  // Variants
  containerVariants: Variants;
  contentVariants: Variants;
  elementVariants: Variants;
  
  // Hover/tap props
  hoverProps: {
    scale: number;
    transition: Transition;
  };
  tapProps: {
    scale: number;
  };
  
  // Stagger utility
  getStaggerDelay: (index: number) => number;
  
  // Entry animation props
  entryProps: {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number };
    exit: { opacity: number; y: number };
  };
}

export const useMediaPlayerAnimations = ({
  isMinimized,
  isVisible,
  reducedMotion = false,
}: UseMediaPlayerAnimationsOptions): MediaPlayerAnimations => {
  
  const animations = useMemo(() => {
    // If reduced motion, use instant transitions
    const durationMultiplier = reducedMotion ? 0 : 1;
    
    // Container transition (mode change)
    const containerTransition: Transition = {
      duration: MEDIA_PLAYER.container.duration * durationMultiplier,
      ease: MEDIA_PLAYER.container.ease,
    };
    
    // Content element transition
    const contentTransition: Transition = {
      duration: MEDIA_PLAYER.content.duration * durationMultiplier,
      ease: MEDIA_PLAYER.content.ease,
    };
    
    // Entry transition
    const entryTransition: Transition = {
      duration: MEDIA_PLAYER.entry.duration * durationMultiplier,
      delay: MEDIA_PLAYER.entry.delay,
      ease: MEDIA_PLAYER.entry.ease,
    };
    
    // Interaction transition (hover/tap)
    const interactionTransition: Transition = {
      duration: MEDIA_PLAYER.interaction.duration * durationMultiplier,
      ease: MEDIA_PLAYER.easing.standard,
    };
    
    // Container variants
    const containerVariants: Variants = {
      hidden: {
        opacity: 0,
        y: MEDIA_PLAYER.entry.y,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: entryTransition,
      },
      exit: {
        opacity: 0,
        y: MEDIA_PLAYER.entry.y / 2,
        transition: {
          duration: MEDIA_PLAYER.duration.normal * durationMultiplier,
          ease: MEDIA_PLAYER.easing.accelerate,
        },
      },
    };
    
    // Content variants (for AnimatePresence children)
    const contentVariants: Variants = {
      hidden: {
        opacity: 0,
      },
      visible: {
        opacity: 1,
        transition: contentTransition,
      },
      exit: {
        opacity: 0,
        transition: {
          duration: MEDIA_PLAYER.duration.fast * durationMultiplier,
          ease: MEDIA_PLAYER.easing.accelerate,
        },
      },
    };
    
    // Individual element variants (with stagger support)
    const elementVariants: Variants = {
      hidden: {
        opacity: 0,
        scale: 0.96,
      },
      visible: (custom: number = 0) => ({
        opacity: 1,
        scale: 1,
        transition: {
          duration: MEDIA_PLAYER.content.duration * durationMultiplier,
          delay: custom * MEDIA_PLAYER.duration.stagger,
          ease: MEDIA_PLAYER.content.ease,
        },
      }),
      exit: {
        opacity: 0,
        scale: 0.98,
        transition: {
          duration: MEDIA_PLAYER.duration.fast * durationMultiplier,
          ease: MEDIA_PLAYER.easing.accelerate,
        },
      },
    };
    
    // Hover props
    const hoverProps = {
      scale: MEDIA_PLAYER.interaction.hoverScale,
      transition: interactionTransition,
    };
    
    // Tap props
    const tapProps = {
      scale: MEDIA_PLAYER.interaction.tapScale,
    };
    
    // Stagger delay utility
    const getStaggerDelay = (index: number): number => {
      return index * MEDIA_PLAYER.duration.stagger;
    };
    
    // Entry animation props
    const entryProps = {
      initial: { opacity: 0, y: MEDIA_PLAYER.entry.y },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: MEDIA_PLAYER.entry.y / 2 },
    };
    
    return {
      containerTransition,
      contentTransition,
      entryTransition,
      interactionTransition,
      containerVariants,
      contentVariants,
      elementVariants,
      hoverProps,
      tapProps,
      getStaggerDelay,
      entryProps,
    };
  }, [reducedMotion]);
  
  return animations;
};

// Export static values for use outside of React components
export const PLAYER_TRANSITIONS = {
  container: {
    duration: MEDIA_PLAYER.container.duration,
    ease: MEDIA_PLAYER.container.ease,
  },
  content: {
    duration: MEDIA_PLAYER.content.duration,
    ease: MEDIA_PLAYER.content.ease,
  },
  entry: {
    duration: MEDIA_PLAYER.entry.duration,
    delay: MEDIA_PLAYER.entry.delay,
    ease: MEDIA_PLAYER.entry.ease,
  },
  interaction: {
    hoverScale: MEDIA_PLAYER.interaction.hoverScale,
    tapScale: MEDIA_PLAYER.interaction.tapScale,
    duration: MEDIA_PLAYER.interaction.duration,
  },
  popover: MEDIA_PLAYER.popover,
} as const;
