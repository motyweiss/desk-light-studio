/**
 * Loading Sequence Configuration
 * 
 * Centralized timing configuration for the entire page load experience.
 * All animations are orchestrated to create a smooth, premium feel.
 */

// =============================================================================
// TIMING CONSTANTS (in milliseconds for timers, seconds for framer-motion)
// =============================================================================

export const LOAD_SEQUENCE = {
  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 1: SPINNER
  // ─────────────────────────────────────────────────────────────────────────────
  spinner: {
    /** Minimum time the spinner is displayed (ms) */
    minDuration: 2000,
    /** Duration of the exit animation (s) */
    exitDuration: 0.6,
    /** Exit animation easing */
    exitEase: [0.16, 1, 0.3, 1] as const,
    /** Scale on exit for subtle zoom effect */
    exitScale: 1.03,
    /** Blur on exit (px) */
    exitBlur: 8,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 2: HEADER ENTRY
  // ─────────────────────────────────────────────────────────────────────────────
  header: {
    /** Delay before header starts entering (s) */
    delay: 0.1,
    /** Duration of header entry (s) */
    duration: 0.5,
    /** Header entry easing */
    ease: [0.22, 0.68, 0.35, 1] as const,
    /** Stagger between internal elements (s) */
    stagger: 0.06,
    /** Delays for each section */
    sections: {
      branding: 0.1,
      climate: 0.16,
      controls: 0.22,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 3: MAIN CONTENT
  // ─────────────────────────────────────────────────────────────────────────────
  content: {
    /** Delay before content starts entering (s) */
    delay: 0.2,
    /** Duration of content entry (s) */
    duration: 0.6,
    /** Content entry easing */
    ease: [0.22, 0.68, 0.35, 1] as const,
    /** Initial scale for content */
    scaleFrom: 0.96,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 4: INNER ELEMENTS (staggered)
  // ─────────────────────────────────────────────────────────────────────────────
  elements: {
    roomTitle: {
      delay: 0.25,
      duration: 0.5,
    },
    deskImage: {
      delay: 0.3,
      duration: 0.7,
    },
    devices: {
      delay: 0.4,
      stagger: 0.1,
      duration: 0.5,
    },
    lightCards: {
      delay: 0.5,
      stagger: 0.08,
      duration: 0.45,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 5: SKELETON & DATA HYDRATION
  // ─────────────────────────────────────────────────────────────────────────────
  skeleton: {
    /** Minimum time skeleton is displayed (s) */
    minDisplayTime: 0.8,
    /** Crossfade duration when data loads (s) */
    crossfadeDuration: 0.5,
    /** Crossfade easing */
    crossfadeEase: [0.25, 0.1, 0.25, 1] as const,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 6: MEDIA PLAYER (enters from bottom)
  // ─────────────────────────────────────────────────────────────────────────────
  mediaPlayer: {
    /** Delay before player starts entering (s) */
    delay: 0.6,
    /** Duration of player entry (s) */
    duration: 0.8,
    /** Initial Y offset (px) */
    yFrom: 100,
    /** Entry easing - soft ease-out */
    ease: [0.16, 1, 0.3, 1] as const,
    /** Opacity animation config */
    opacity: {
      duration: 0.5,
      delay: 0.65,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 7: FINISHING TOUCHES
  // ─────────────────────────────────────────────────────────────────────────────
  finishing: {
    progressRings: {
      delay: 0.7,
      duration: 1.2,
    },
    climateData: {
      delay: 0.4,
      duration: 0.4,
    },
  },
} as const;

// =============================================================================
// LOAD STAGES
// =============================================================================

export type LoadStage = 
  | 'spinner'    // Initial spinner displayed
  | 'exiting'    // Spinner exiting
  | 'entering'   // Content entering
  | 'hydrating'  // Data loading/hydrating
  | 'ready';     // Everything complete

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate the absolute delay for an element from the start of content entry
 */
export const getElementDelay = (elementKey: keyof typeof LOAD_SEQUENCE.elements): number => {
  const element = LOAD_SEQUENCE.elements[elementKey];
  return LOAD_SEQUENCE.content.delay + element.delay;
};

/**
 * Get staggered delay for an item in a list
 */
export const getStaggeredDelay = (
  elementKey: 'devices' | 'lightCards',
  index: number
): number => {
  const element = LOAD_SEQUENCE.elements[elementKey];
  return getElementDelay(elementKey) + (index * element.stagger);
};

// =============================================================================
// TIMELINE REFERENCE
// =============================================================================
/**
 * Timeline from user's perspective:
 * 
 * 0.0s ─────── Spinner appears
 *         │
 * 2.0s ─────── Spinner starts exiting (min duration reached)
 *         │
 * 2.1s ─────── Header branding enters
 *         │
 * 2.16s ────── Climate indicators enter
 *         │
 * 2.2s ─────── Main content starts entering
 *         │
 * 2.25s ────── Room title appears
 *         │
 * 2.3s ─────── Desk image fades in
 *         │
 * 2.4s ─────── Devices start appearing (staggered)
 *         │
 * 2.5s ─────── Light cards appear (staggered)
 *         │
 * 2.6s ─────── Media player rises from bottom
 *         │
 * 2.7s ─────── Progress rings animate
 *         │
 * 3.0s ─────── Data replaces skeleton (crossfade)
 *         │
 * 3.5s ─────── Complete - all animations finished
 */
