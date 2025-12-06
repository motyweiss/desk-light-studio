export type AnimationSource = 'user' | 'external' | 'initial';

export const EASING = {
  smooth: [0.22, 0.03, 0.26, 1] as const,
  quickOut: [0.33, 0.0, 0.2, 1] as const,
  gentle: [0.25, 0.1, 0.25, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  mediaPlayer: [0.32, 0.72, 0, 1] as const,
  entrance: [0.19, 1, 0.22, 1] as const,
} as const;

export const DURATION = {
  lightOn: 1.2,
  lightOff: 0.6,
  glowOn: 1.2,
  glowOff: 0.6,
  glowDelay: 0.15,
  fast: 0.3,
  medium: 0.5,
  background: 0.8,
  mediaEntry: 1.0,
  pageTransition: 0.5,
} as const;

// Unified light animation system - all components use these exact timings
export const LIGHT_ANIMATION = {
  turnOn: {
    duration: 1.2,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
  turnOff: {
    duration: 1.0, // Softer, more gradual fade out
    ease: [0.25, 0.1, 0.25, 1] as const, // Gentle easing for pleasant transition
  },
  slider: {
    duration: 0.2,
    ease: [0.25, 0.1, 0.25, 1] as const,
  },
  stagger: {
    glow: 0.05,
    background: 0.1,
  }
} as const;

export const POLL_INTERVAL = {
  lights: 1500,        // 1.5 seconds for light states (reduced load)
  sensors: 5000,       // 5 seconds for sensors (less frequent)
  mediaPlayer: 2000,   // 2 seconds for media player
} as const;

export const BLOCKING_WINDOW = {
  manualChange: 800,   // Block remote updates for 800ms after manual change (reduced for faster sync)
  pendingConfirm: 400, // Wait 400ms for HA to confirm before clearing pending (faster confirmation)
} as const;

export const PAGE_TRANSITIONS = {
  duration: 0.5,
  ease: [0.22, 0.03, 0.26, 1] as const,
} as const;

export const SPEAKER_SHEET_TRANSITIONS = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1] as const,
} as const;

// Coordinated page load animation sequence
export const PAGE_LOAD_SEQUENCE = {
  overlayExit: {
    duration: 0.4,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
  contentDelay: 0.15, // Wait after overlay starts fading
  header: {
    delay: 0,
    duration: 0.5,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
  masterSwitch: {
    delay: 0.08,
    duration: 0.5,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
  devices: {
    delay: 0.12,
    duration: 0.5,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
  lightCards: {
    delay: 0.18,
    stagger: 0.06,
    duration: 0.4,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
  deskImage: {
    delay: 0.25,
    duration: 0.6,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
  circularProgress: {
    delay: 0.8,
    duration: 1.0,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
} as const;

export const MEDIA_PLAYER_ANIMATIONS = {
  trackChange: {
    duration: 0.4,
    ease: [0.25, 0.1, 0.25, 1] as const,
  },
  modeChange: {
    duration: 0.5,
    ease: [0.32, 0.72, 0, 1] as const,
  },
  textFade: {
    duration: 0.35,
    ease: [0.25, 0.1, 0.25, 1] as const,
  },
} as const;

export const HEADER_ANIMATIONS = {
  entry: {
    duration: 0.6,
    delay: 0.1,
    ease: [0.16, 1, 0.3, 1] as const,
  },
  climateExpand: {
    duration: 0.35,
    ease: [0.34, 1.56, 0.64, 1] as const,
  },
  indicatorStagger: 0.08,
} as const;

// Data transition animations for skeleton → data reveal
export const DATA_TRANSITION = {
  skeleton: {
    shimmerDuration: 1.5,
    pulseEase: 'easeInOut',
  },
  reveal: {
    duration: 0.5,
    stagger: 0.08,
    ease: [0.22, 0.03, 0.26, 1] as const,
  },
  fadeIn: {
    duration: 0.4,
    ease: [0.25, 0.1, 0.25, 1] as const,
  },
} as const;
