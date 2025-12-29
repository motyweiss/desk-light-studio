/**
 * Animation Presets
 * 
 * Reusable animation configurations for Framer Motion components.
 * These presets combine tokens to create consistent, composable animations.
 */

import type { Transition, Variants, TargetAndTransition } from 'framer-motion';
import { TIMING, EASE, STAGGER, DELAY, TRANSITIONS } from './tokens';

// =============================================================================
// MOTION PRESETS (initial/animate/exit patterns)
// =============================================================================

export const MOTION_PRESETS = {
  // ---------------------------------------------------------------------------
  // Fade Animations
  // ---------------------------------------------------------------------------
  
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  },
  
  // ---------------------------------------------------------------------------
  // Scale Animations
  // ---------------------------------------------------------------------------
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
  
  scaleInUp: {
    initial: { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: -4 },
  },
  
  // ---------------------------------------------------------------------------
  // Slide Animations
  // ---------------------------------------------------------------------------
  
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  
  // ---------------------------------------------------------------------------
  // Subtle Animations (for reduced motion or subtle effects)
  // ---------------------------------------------------------------------------
  
  subtle: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
} as const;

// =============================================================================
// INTERACTION PRESETS (hover/tap states)
// =============================================================================

export const INTERACTION_PRESETS = {
  /** Standard button interaction */
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: TRANSITIONS.micro,
  },
  
  /** Card hover effect */
  card: {
    whileHover: { scale: 1.01, y: -2 },
    transition: TRANSITIONS.fast,
  },
  
  /** Subtle hover */
  subtle: {
    whileHover: { opacity: 0.8 },
    transition: TRANSITIONS.micro,
  },
  
  /** Icon button */
  icon: {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 },
    transition: TRANSITIONS.micro,
  },
  
  /** List item */
  listItem: {
    whileHover: { x: 4, backgroundColor: 'rgba(255,255,255,0.05)' },
    transition: TRANSITIONS.fast,
  },
} as const;

// =============================================================================
// VARIANTS PRESETS (for variant-based animations)
// =============================================================================

export const VARIANTS = {
  /** Stagger container */
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: STAGGER.normal,
        delayChildren: DELAY.minimal,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: STAGGER.tight,
        staggerDirection: -1,
      },
    },
  } satisfies Variants,
  
  /** Stagger item (use with staggerContainer) */
  staggerItem: {
    hidden: { opacity: 0, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: TRANSITIONS.fast,
    },
    exit: { 
      opacity: 0, 
      y: -4,
      transition: TRANSITIONS.fast,
    },
  } satisfies Variants,
  
  /** Fade variant */
  fade: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: TRANSITIONS.fade,
    },
    exit: { 
      opacity: 0,
      transition: TRANSITIONS.fade,
    },
  } satisfies Variants,
  
  /** Scale variant */
  scale: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: TRANSITIONS.standard,
    },
    exit: { 
      opacity: 0, 
      scale: 0.96,
      transition: TRANSITIONS.fast,
    },
  } satisfies Variants,
  
  /** Overlay variant */
  overlay: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: TIMING.medium,
        ease: EASE.smooth,
      },
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: TIMING.fast,
        ease: EASE.in,
      },
    },
  } satisfies Variants,
  
  /** Popover variant */
  popover: {
    hidden: { opacity: 0, scale: 0.95, y: -4 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: TRANSITIONS.fast,
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: -4,
      transition: TRANSITIONS.fast,
    },
  } satisfies Variants,
} as const;

// =============================================================================
// LOADING STATE PRESETS
// =============================================================================

export const LOADING_PRESETS = {
  /** Pulse animation */
  pulse: {
    animate: {
      opacity: [0.4, 0.7, 0.4],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: EASE.smooth,
    },
  },
  
  /** Shimmer effect */
  shimmer: {
    animate: {
      x: ['-100%', '100%'],
    },
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: EASE.linear,
    },
  },
  
  /** Skeleton fade */
  skeleton: {
    initial: { opacity: 0.6 },
    animate: { opacity: [0.6, 0.8, 0.6] },
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: EASE.smooth,
    },
  },
  
  /** Spinner rotation */
  spinner: {
    animate: {
      rotate: 360,
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: EASE.linear,
    },
  },
} as const;

// =============================================================================
// GLOW/AMBIENT PRESETS
// =============================================================================

export const AMBIENT_PRESETS = {
  /** Gentle glow pulse */
  glowPulse: {
    animate: {
      opacity: [0.3, 0.5, 0.3],
      scale: [1, 1.02, 1],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: EASE.smooth,
    },
  },
  
  /** Breathing effect */
  breathing: {
    animate: {
      opacity: [0.8, 1, 0.8],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: EASE.smooth,
    },
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create stagger props for a specific index
 */
export const createStaggerProps = (
  index: number,
  options?: {
    stagger?: number;
    delay?: number;
    preset?: keyof typeof MOTION_PRESETS;
  }
) => {
  const { 
    stagger = STAGGER.normal, 
    delay = 0,
    preset = 'fadeInUp',
  } = options ?? {};
  
  const motionPreset = MOTION_PRESETS[preset];
  
  return {
    ...motionPreset,
    transition: {
      ...TRANSITIONS.fast,
      delay: delay + (index * stagger),
    },
  };
};

/**
 * Create a transition with custom delay
 */
export const withDelay = (
  transition: Transition,
  delay: number
): Transition => ({
  ...transition,
  delay,
});

/**
 * Get transition for reduced motion
 */
export const getReducedMotionTransition = (): Transition => ({
  duration: 0,
});

/**
 * Create crossfade animation props
 */
export const createCrossfadeProps = (isVisible: boolean) => ({
  initial: { opacity: 0 },
  animate: { opacity: isVisible ? 1 : 0 },
  transition: TRANSITIONS.crossfade,
});
