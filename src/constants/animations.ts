export type AnimationSource = 'user' | 'external' | 'initial';

// ============================================================
// UNIFIED EASING CURVES
// ============================================================
export const EASING = {
  smooth: [0.25, 0.1, 0.25, 1] as const,      // Default smooth transitions
  entrance: [0.22, 0.03, 0.26, 1] as const,   // Content entry animations
  gentle: [0.16, 0.1, 0.3, 1] as const,       // Very soft, gradual transitions
  spring: [0.34, 1.56, 0.64, 1] as const,     // Bouncy, playful
  mediaPlayer: [0.32, 0.72, 0, 1] as const,   // Media player specific
  quickOut: [0.33, 0.0, 0.2, 1] as const,     // Fast start, smooth end
} as const;

// ============================================================
// DURATION CONSTANTS
// ============================================================
export const DURATION = {
  // Light animations
  lightOn: 1.2,
  lightOff: 1.4,
  glowOn: 1.2,
  glowOff: 1.4,
  glowDelay: 0.15,
  
  // General
  fast: 0.3,
  medium: 0.5,
  slow: 0.8,
  
  // Page specific
  mediaEntry: 1.0,
  pageTransition: 0.5,
} as const;

// ============================================================
// LIGHT ANIMATION SYSTEM
// ============================================================
export const LIGHT_ANIMATION = {
  turnOn: {
    duration: 1.2,
    ease: EASING.entrance,
  },
  turnOff: {
    duration: 1.4,
    ease: EASING.gentle,
  },
  slider: {
    duration: 0.2,
    ease: EASING.smooth,
  },
  stagger: {
    delay: 0.05,
  }
} as const;

// ============================================================
// UNIFIED PAGE LOAD SEQUENCE
// All timings coordinated from a single source
// ============================================================
export const PAGE_LOAD = {
  // Overlay phase
  overlay: {
    exitDuration: 0.5,
    ease: EASING.smooth,
  },
  
  // Content container (starts after overlay exit completes)
  container: {
    delay: 0.05,
    duration: 0.5,
    ease: EASING.entrance,
  },
  
  // Individual element timing (relative to container start)
  // ORDER: header → devices → lightCards → deskImage (left to right visual flow)
  elements: {
    header: {
      delay: 0,
      duration: 0.5,
    },
    masterSwitch: {
      delay: 0.05,
      duration: 0.45,
    },
    devices: {
      delay: 0.12,
      stagger: 0.05,
      duration: 0.45,
    },
    lightCards: {
      delay: 0.2,
      stagger: 0.05,
      duration: 0.45,
    },
    deskImage: {
      delay: 0.25,
      duration: 0.55,
    },
  },
  
  // Post-content effects
  effects: {
    progressRings: {
      delay: 0.2,
      duration: 0.6,
    },
  },
  
  // Skeleton to data crossfade
  crossfade: {
    duration: 0.5,
    blur: 4,
    ease: EASING.smooth,
  },
} as const;

// Legacy alias for backwards compatibility
export const PAGE_LOAD_SEQUENCE = {
  overlayExit: PAGE_LOAD.overlay,
  container: PAGE_LOAD.container,
  header: { ...PAGE_LOAD.elements.header, ease: EASING.entrance },
  masterSwitch: { ...PAGE_LOAD.elements.masterSwitch, ease: EASING.entrance },
  devices: { ...PAGE_LOAD.elements.devices, ease: EASING.entrance },
  lightCards: { ...PAGE_LOAD.elements.lightCards, ease: EASING.entrance },
  deskImage: { ...PAGE_LOAD.elements.deskImage, ease: EASING.entrance, scale: 1 },
  circularProgress: { ...PAGE_LOAD.effects.progressRings, ease: EASING.entrance },
} as const;

// ============================================================
// SKELETON TO DATA TRANSITION
// ============================================================
export const DATA_TRANSITION = {
  skeleton: {
    shimmerDuration: 1.8,
    pulseEase: 'easeInOut',
  },
  skeletonExit: {
    duration: PAGE_LOAD.crossfade.duration,
    ease: EASING.smooth,
  },
  dataEnter: {
    duration: PAGE_LOAD.crossfade.duration,
    delay: 0.05,
    ease: EASING.smooth,
    blur: PAGE_LOAD.crossfade.blur,
  },
  reveal: {
    duration: 0.5,
    stagger: 0.06,
    ease: EASING.entrance,
  },
  fadeIn: {
    duration: 0.4,
    ease: EASING.smooth,
  },
} as const;

// ============================================================
// POLLING INTERVALS
// ============================================================
export const POLL_INTERVAL = {
  lights: 1500,
  sensors: 5000,
  mediaPlayer: 400,
} as const;

// ============================================================
// STATE MANAGEMENT WINDOWS
// ============================================================
export const BLOCKING_WINDOW = {
  manualChange: 800,
  pendingConfirm: 400,
} as const;

// ============================================================
// PAGE TRANSITIONS
// ============================================================
export const PAGE_TRANSITIONS = {
  duration: 0.5,
  ease: EASING.entrance,
} as const;

export const SPEAKER_SHEET_TRANSITIONS = {
  duration: 0.5,
  ease: EASING.smooth,
} as const;

// ============================================================
// MEDIA PLAYER ANIMATIONS - Unified system
// ============================================================
export const MEDIA_PLAYER = {
  // ─────────────────────────────────────────────────────────
  // LAYOUT - Smooth tween for size/position changes (no bounce)
  // ─────────────────────────────────────────────────────────
  layout: {
    duration: 0.35,
    ease: [0.32, 0.72, 0, 1] as const,
  },
  
  // ─────────────────────────────────────────────────────────
  // FADE - For opacity transitions (content, crossfades)
  // ─────────────────────────────────────────────────────────
  fade: {
    duration: 0.25,
    ease: [0.25, 0.1, 0.25, 1] as const,
  },
  
  // ─────────────────────────────────────────────────────────
  // STAGGER - For sequential element animations
  // ─────────────────────────────────────────────────────────
  stagger: {
    duration: 0.28,
    delay: 0.035,
    y: 6,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
  
  // ─────────────────────────────────────────────────────────
  // ENTRY - Initial page load appearance
  // ─────────────────────────────────────────────────────────
  entry: {
    delay: 0.2,
    duration: 0.5,
    y: 16,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
  
  // ─────────────────────────────────────────────────────────
  // MODE - Minimized/Expanded state switch
  // ─────────────────────────────────────────────────────────
  mode: {
    duration: 0.32,
    ease: [0.32, 0.72, 0, 1] as const,
  },
  
  // ─────────────────────────────────────────────────────────
  // INTERACTION - Hover/tap micro-interactions
  // ─────────────────────────────────────────────────────────
  interaction: {
    hoverScale: 1.04,
    tapScale: 0.97,
    duration: 0.15,
  },
  
  // ─────────────────────────────────────────────────────────
  // POPOVER - Speaker/menu popover animations
  // ─────────────────────────────────────────────────────────
  popover: {
    duration: 0.25,
    y: 8,
    ease: [0.4, 0, 0.2, 1] as const,
  },
  
  // ─────────────────────────────────────────────────────────
  // SLIDER - Progress/volume slider feedback
  // ─────────────────────────────────────────────────────────
  slider: {
    duration: 0.1,
    ease: [0.4, 0, 0.2, 1] as const,
  },
} as const;

// ============================================================
// HEADER ANIMATIONS
// ============================================================
export const HEADER_ANIMATIONS = {
  entry: {
    duration: 0.6,
    delay: 0.1,
    ease: EASING.entrance,
  },
  climateExpand: {
    duration: 0.35,
    ease: EASING.spring,
  },
  indicatorStagger: 0.06,
} as const;
