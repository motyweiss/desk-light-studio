/**
 * Animation Tokens
 * 
 * Centralized animation timing, easing, and configuration values.
 * All animations in the app should reference these tokens for consistency.
 */

// =============================================================================
// TIMING TOKENS
// =============================================================================

export const TIMING = {
  /** No animation - instant */
  instant: 0,
  /** Micro-interactions (toggles, small feedback) */
  micro: 0.1,
  /** Quick feedback animations */
  fast: 0.2,
  /** Standard transitions */
  medium: 0.35,
  /** Emphasis transitions */
  slow: 0.5,
  /** Major state changes */
  dramatic: 0.8,
  /** Initial page load elements */
  entrance: 1.2,
} as const;

// =============================================================================
// EASING TOKENS
// =============================================================================

export const EASE = {
  /** Linear - constant speed */
  linear: [0, 0, 1, 1] as const,
  /** Smooth - default balanced easing */
  smooth: [0.25, 0.1, 0.25, 1] as const,
  /** Ease out - elements entering (decelerate) */
  out: [0.22, 0.03, 0.26, 1] as const,
  /** Ease in - elements exiting (accelerate) */
  in: [0.4, 0, 1, 1] as const,
  /** Gentle - slow, smooth transitions */
  gentle: [0.16, 0.1, 0.3, 1] as const,
  /** Snappy - quick, responsive feel */
  snappy: [0.32, 0.72, 0, 1] as const,
  /** Bounce - playful overshoot */
  bounce: [0.34, 1.56, 0.64, 1] as const,
  /** Entrance - smooth entry with slight overshoot */
  entrance: [0.22, 1, 0.36, 1] as const,
} as const;

// =============================================================================
// STAGGER TOKENS
// =============================================================================

export const STAGGER = {
  /** Tight stagger for many items */
  tight: 0.03,
  /** Normal stagger */
  normal: 0.05,
  /** Relaxed stagger for emphasis */
  relaxed: 0.08,
  /** Wide stagger for dramatic effect */
  wide: 0.12,
} as const;

// =============================================================================
// DELAY TOKENS
// =============================================================================

export const DELAY = {
  /** No delay */
  none: 0,
  /** Minimal delay */
  minimal: 0.05,
  /** Short delay */
  short: 0.1,
  /** Medium delay */
  medium: 0.2,
  /** Long delay */
  long: 0.4,
  /** Page content delay (after overlay) */
  pageContent: 0.15,
} as const;

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

export const TRANSITIONS = {
  /** Instant change */
  instant: {
    duration: TIMING.instant,
  },
  
  /** Micro-interaction (toggles, small buttons) */
  micro: {
    duration: TIMING.micro,
    ease: EASE.snappy,
  },
  
  /** Fast feedback */
  fast: {
    duration: TIMING.fast,
    ease: EASE.out,
  },
  
  /** Standard transition */
  standard: {
    duration: TIMING.medium,
    ease: EASE.smooth,
  },
  
  /** Smooth layout changes */
  layout: {
    duration: TIMING.medium,
    ease: EASE.snappy,
  },
  
  /** Slow emphasis */
  emphasis: {
    duration: TIMING.slow,
    ease: EASE.gentle,
  },
  
  /** Dramatic state change */
  dramatic: {
    duration: TIMING.dramatic,
    ease: EASE.entrance,
  },
  
  /** Page entrance */
  entrance: {
    duration: TIMING.entrance,
    ease: EASE.entrance,
  },
  
  /** Fade only */
  fade: {
    duration: TIMING.fast,
    ease: EASE.smooth,
  },
  
  /** Crossfade between states */
  crossfade: {
    duration: TIMING.medium,
    ease: EASE.smooth,
  },
} as const;

// =============================================================================
// SPRING CONFIGURATIONS
// =============================================================================

export const SPRINGS = {
  /** Gentle spring - smooth, no overshoot */
  gentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
  },
  
  /** Responsive spring - quick response */
  responsive: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  
  /** Bouncy spring - playful overshoot */
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 15,
    mass: 1,
  },
  
  /** Stiff spring - quick, minimal overshoot */
  stiff: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 35,
    mass: 1,
  },
} as const;

// =============================================================================
// ANIMATION SEQUENCES
// =============================================================================

export const SEQUENCES = {
  /** Page load sequence timings */
  pageLoad: {
    overlayDuration: TIMING.slow,
    overlayExit: TIMING.medium,
    contentDelay: DELAY.pageContent,
    contentDuration: TIMING.medium,
    staggerInterval: STAGGER.normal,
    hydrationDelay: DELAY.short,
  },
  
  /** Light control sequence */
  lightControl: {
    turnOnDuration: TIMING.dramatic,
    turnOffDuration: TIMING.slow,
    sliderDuration: TIMING.fast,
    externalSyncDuration: TIMING.medium,
  },
  
  /** Media player sequence */
  mediaPlayer: {
    expandDuration: TIMING.medium,
    collapseDuration: TIMING.medium,
    fadeDuration: TIMING.fast,
    controlsStagger: STAGGER.tight,
  },
  
  /** Climate indicators sequence */
  climate: {
    entryDuration: TIMING.medium,
    staggerInterval: STAGGER.relaxed,
    updateDuration: TIMING.fast,
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type TimingKey = keyof typeof TIMING;
export type EaseKey = keyof typeof EASE;
export type StaggerKey = keyof typeof STAGGER;
export type TransitionKey = keyof typeof TRANSITIONS;
export type SpringKey = keyof typeof SPRINGS;
export type SequenceKey = keyof typeof SEQUENCES;
