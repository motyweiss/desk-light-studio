export const EASING = {
  smooth: [0.22, 0.03, 0.26, 1] as const,
  quickOut: [0.33, 0.0, 0.2, 1] as const,
  gentle: [0.25, 0.1, 0.25, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  mediaPlayer: [0.32, 0.72, 0, 1] as const,
  entrance: [0.19, 1, 0.22, 1] as const,
} as const;

export const DURATION = {
  lightOn: 1.8,
  lightOff: 0.8,
  glowOn: 1.2,
  glowOff: 0.8,
  glowDelay: 0.15,
  fast: 0.3,
  medium: 0.5,
  background: 0.8,
  mediaEntry: 1.0,
  pageTransition: 0.5,
} as const;

export const POLL_INTERVAL = {
  lights: 1000,        // 1 second for light states
  sensors: 1500,       // 1.5 seconds for sensors
  mediaPlayer: 600,    // 600ms for immediate music detection
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
