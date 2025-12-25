import { LIGHT_ANIMATION, EASING } from "@/constants/animations";

// ============================================================
// BACKGROUND COLOR SYSTEM
// ============================================================
export const BACKGROUND_COLORS = {
  // Base state (all lights off)
  base: {
    hue: 35,
    saturation: 16,
    lightness: 51,
  },
  // Maximum warmth (all lights on at 100%)
  warm: {
    hue: 42,
    saturation: 28,
    lightness: 56,
  },
  // Light contribution weights for warmth calculation
  weights: {
    spotlight: 0.40,
    deskLamp: 0.35,
    monitorLight: 0.25,
  },
} as const;

// ============================================================
// GLASS EFFECT SETTINGS
// ============================================================
export const GLASS_EFFECT = {
  blur: 120,
  noiseOpacity: 0.03,
  overlayOpacity: 0.08,
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
    duration: 8,
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
// ============================================================
export const GRADIENTS = {
  // Base mesh gradient points
  mesh: [
    { x: 20, y: 30, opacity: 0.12 },
    { x: 80, y: 70, opacity: 0.10 },
    { x: 50, y: 50, opacity: 0.08 },
  ],
  // Glass overlay gradient
  glass: {
    startOpacity: 0.06,
    endOpacity: 0.02,
  },
} as const;
