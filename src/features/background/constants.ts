import { LIGHT_ANIMATION, EASING } from "@/constants/animations";

// ============================================================
// BACKGROUND COLOR SYSTEM
// Calibrated to match desk images for seamless integration
// ============================================================
export const BACKGROUND_COLORS = {
  // Base state (all lights off) - warm beige matching desk-000
  base: {
    hue: 35,
    saturation: 16,
    lightness: 51,
  },
  // Maximum warmth (all lights on at 100%) - golden warm matching desk-111
  warm: {
    hue: 38,
    saturation: 22,
    lightness: 54,
  },
  // Light contribution weights for warmth calculation
  weights: {
    spotlight: 0.35,     // Spotlight adds most warmth
    deskLamp: 0.40,      // Desk lamp is warm orange
    monitorLight: 0.25,  // Monitor light is subtle
  },
} as const;

// ============================================================
// LIGHTING STATE COLOR PROFILES
// Each state has a specific color to match the desk image
// Format: [hue, saturation, lightness]
// ============================================================
export const LIGHTING_STATE_COLORS: Record<string, [number, number, number]> = {
  "000": [35, 16, 51],   // All off - neutral beige
  "001": [36, 18, 52],   // Monitor only - slight cool warmth
  "010": [37, 20, 52],   // Desk lamp only - warm orange tint
  "011": [37, 21, 53],   // Desk + Monitor - warmer
  "100": [36, 19, 52],   // Spotlight only - warm from above
  "101": [37, 20, 53],   // Spotlight + Monitor
  "110": [38, 21, 53],   // Spotlight + Desk lamp - warmest combo
  "111": [38, 22, 54],   // All on - full warmth
};

// ============================================================
// GLASS EFFECT SETTINGS
// ============================================================
export const GLASS_EFFECT = {
  blur: 120,
  noiseOpacity: 0.02,
  overlayOpacity: 0.06,
} as const;

// ============================================================
// BACKGROUND ANIMATION TIMING
// Synchronized with light animations
// ============================================================
export const BACKGROUND_ANIMATION = {
  // Warmth layer transitions (match light timing)
  warmth: {
    on: {
      duration: LIGHT_ANIMATION.turnOn.duration,
      ease: LIGHT_ANIMATION.turnOn.ease,
    },
    off: {
      duration: LIGHT_ANIMATION.turnOff.duration,
      ease: LIGHT_ANIMATION.turnOff.ease,
    },
  },
  // Initial page load
  initial: {
    duration: 0.8,
    ease: EASING.smooth,
  },
  // Subtle shimmer animation
  shimmer: {
    duration: 10,
    ease: "easeInOut" as const,
  },
  // Mesh gradient animation
  mesh: {
    duration: 20,
    ease: "linear" as const,
  },
} as const;

// ============================================================
// GRADIENT DEFINITIONS
// Subtle mesh for depth without competing with desk image
// ============================================================
export const GRADIENTS = {
  // Base mesh gradient points - very subtle
  mesh: [
    { x: 20, y: 30, opacity: 0.06 },
    { x: 80, y: 70, opacity: 0.05 },
    { x: 50, y: 50, opacity: 0.04 },
  ],
  // Glass overlay gradient
  glass: {
    startOpacity: 0.04,
    endOpacity: 0.02,
  },
} as const;
