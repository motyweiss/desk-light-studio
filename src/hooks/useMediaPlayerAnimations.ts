import { useMemo } from 'react';
import { MEDIA_PLAYER } from '@/constants/animations';
import type { Transition, Variants } from 'framer-motion';

interface UseMediaPlayerAnimationsOptions {
  isMinimized: boolean;
  isVisible: boolean;
  reducedMotion?: boolean;
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
  reducedMotion = false,
}: UseMediaPlayerAnimationsOptions): MediaPlayerAnimations => {
  
  const animations = useMemo(() => {
    const durationMultiplier = reducedMotion ? 0 : 1;
    
    // Layout spring - for size/position changes
    const layoutTransition: Transition = {
      type: MEDIA_PLAYER.layout.type,
      stiffness: MEDIA_PLAYER.layout.stiffness,
      damping: MEDIA_PLAYER.layout.damping,
      mass: MEDIA_PLAYER.layout.mass,
    };
    
    // Fade transition - for opacity changes
    const fadeTransition: Transition = {
      duration: MEDIA_PLAYER.fade.duration * durationMultiplier,
      ease: MEDIA_PLAYER.fade.ease,
    };
    
    // Entry transition - initial page load
    const entryTransition: Transition = {
      duration: MEDIA_PLAYER.entry.duration * durationMultiplier,
      delay: MEDIA_PLAYER.entry.delay,
      ease: MEDIA_PLAYER.entry.ease,
    };
    
    // Mode transition - minimized/expanded switch
    const modeTransition: Transition = {
      duration: MEDIA_PLAYER.mode.duration * durationMultiplier,
      ease: MEDIA_PLAYER.mode.ease,
    };
    
    // Stagger props generator
    const staggerProps = (index: number) => ({
      initial: { opacity: 0, y: MEDIA_PLAYER.stagger.y },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -4 },
      transition: {
        duration: MEDIA_PLAYER.stagger.duration * durationMultiplier,
        delay: index * MEDIA_PLAYER.stagger.delay,
        ease: MEDIA_PLAYER.stagger.ease,
      },
    });
    
    // Entry props - for initial appearance
    const entryProps = {
      initial: { opacity: 0, y: MEDIA_PLAYER.entry.y },
      animate: { opacity: 1, y: 0 },
      transition: entryTransition,
    };
    
    // Hover props
    const hoverProps = {
      scale: MEDIA_PLAYER.interaction.hoverScale,
      transition: {
        duration: MEDIA_PLAYER.interaction.duration * durationMultiplier,
        ease: MEDIA_PLAYER.fade.ease,
      },
    };
    
    // Tap props
    const tapProps = {
      scale: MEDIA_PLAYER.interaction.tapScale,
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
  layout: MEDIA_PLAYER.layout,
  fade: MEDIA_PLAYER.fade,
  entry: MEDIA_PLAYER.entry,
  mode: MEDIA_PLAYER.mode,
  stagger: MEDIA_PLAYER.stagger,
  interaction: MEDIA_PLAYER.interaction,
  popover: MEDIA_PLAYER.popover,
} as const;
