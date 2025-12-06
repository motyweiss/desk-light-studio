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
  background: 0.8,
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
    glow: 0.05,
    background: 0.1,
  }
} as const;

// ============================================================
// PAGE LOAD ANIMATION SEQUENCE
// Synchronized timing for smooth initial page load
// ============================================================
export const PAGE_LOAD_SEQUENCE = {
  // Phase 1: Overlay exit
  overlayExit: {
    duration: 0.5,
    ease: EASING.smooth,
  },
  
  // Phase 2: Content container fade in
  container: {
    delay: 0.05,
    duration: 0.5,
    ease: EASING.entrance,
  },
  
  // Phase 3: Header elements
  header: {
    delay: 0.08,
    duration: 0.5,
    ease: EASING.entrance,
    y: 10,
  },
  
  // Phase 4: Master switch
  masterSwitch: {
    delay: 0.1,
    duration: 0.45,
    ease: EASING.entrance,
  },
  
  // Phase 5: Device battery indicators
  devices: {
    delay: 0.15,
    stagger: 0.06,
    duration: 0.45,
    ease: EASING.entrance,
    y: 8,
  },
  
  // Phase 6: Light control cards
  lightCards: {
    delay: 0.2,
    stagger: 0.06,
    duration: 0.45,
    ease: EASING.entrance,
    y: 10,
  },
  
  // Phase 7: Desk image
  deskImage: {
    delay: 0.12,
    duration: 0.6,
    ease: EASING.entrance,
    scale: 0.985,
  },
  
  // Phase 8: Progress rings
  circularProgress: {
    delay: 0.4,
    duration: 0.7,
    ease: EASING.entrance,
  },
  
  // Phase 9: Glow effects
  glowLayers: {
    delay: 0.5,
    duration: 0.8,
    ease: EASING.smooth,
  },
} as const;

// ============================================================
// SKELETON TO DATA TRANSITION
// Smooth crossfade between loading and real content
// ============================================================
export const DATA_TRANSITION = {
  skeleton: {
    shimmerDuration: 1.5,
    pulseEase: 'easeInOut',
  },
  // Skeleton fade out
  skeletonExit: {
    duration: 0.35,
    ease: EASING.smooth,
  },
  // Data fade in (starts slightly before skeleton fully gone)
  dataEnter: {
    duration: 0.45,
    delay: 0.1,
    ease: EASING.smooth,
  },
  // Combined reveal
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
  mediaPlayer: 600,
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
// MEDIA PLAYER ANIMATIONS
// ============================================================
export const MEDIA_PLAYER_ANIMATIONS = {
  entry: {
    duration: 0.8,
    delay: 0.4,
    ease: EASING.entrance,
  },
  trackChange: {
    duration: 0.4,
    ease: EASING.smooth,
  },
  modeChange: {
    duration: 0.5,
    ease: EASING.mediaPlayer,
  },
  textFade: {
    duration: 0.35,
    ease: EASING.smooth,
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
