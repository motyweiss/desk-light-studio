import { EASING, DURATION, LIGHT_ANIMATION, POLL_INTERVAL, BLOCKING_WINDOW } from '@/constants/animations';

/**
 * Design System Tokens - Single Source of Truth
 * All design tokens used throughout the application
 */

export const colors = {
  // Base colors
  background: 'hsl(35 16% 51%)',
  foreground: 'hsl(40 10% 95%)',
  
  // UI colors
  card: 'hsl(220 18% 12%)',
  cardForeground: 'hsl(40 10% 95%)',
  popover: 'hsl(220 18% 12%)',
  popoverForeground: 'hsl(40 10% 95%)',
  
  // Brand colors
  primary: 'hsl(40 100% 60%)',
  primaryForeground: 'hsl(220 20% 8%)',
  secondary: 'hsl(220 15% 18%)',
  secondaryForeground: 'hsl(40 10% 95%)',
  
  // Utility colors
  muted: 'hsl(220 15% 18%)',
  mutedForeground: 'hsl(40 5% 60%)',
  accent: 'hsl(35 100% 55%)',
  accentForeground: 'hsl(220 20% 8%)',
  destructive: 'hsl(0 84.2% 60.2%)',
  destructiveForeground: 'hsl(40 10% 95%)',
  
  // Border & Input
  border: 'hsl(220 15% 20%)',
  input: 'hsl(220 15% 20%)',
  ring: 'hsl(40 100% 60%)',
  
  // Custom warm colors
  warmGlow: 'hsl(43 90% 60%)',
  warmGlowSoft: 'hsl(44 85% 65%)',
  shadowWarm: 'hsl(42 95% 55%)',
  containerBg: 'hsl(218 20% 13%)',
  
  // Lighting glow colors
  spotlightGlow: 'hsl(42 85% 58%)',
  lampGlow: 'hsl(44 80% 60%)',
  
  // Ambient glow colors for lighting effects
  glowWarmOrange: 'hsl(40 45% 50%)',
  glowWarmGold: 'hsl(42 50% 52%)',
  glowWarmCream: 'hsl(41 48% 52%)',
  glowBase: 'hsl(41 40% 48%)',
  
  // Status colors for sensors
  statusCold: 'hsl(200 70% 55%)',
  statusCool: 'hsl(180 60% 50%)',
  statusComfortable: 'hsl(142 70% 45%)',
  statusWarm: 'hsl(35 90% 55%)',
  statusHot: 'hsl(0 75% 55%)',
  statusOptimal: 'hsl(142 70% 45%)',
  statusCaution: 'hsl(45 90% 55%)',
  statusWarning: 'hsl(25 90% 55%)',
  statusDanger: 'hsl(0 75% 55%)',
  
  // Interactive element colors
  interactiveDot: 'hsl(38 70% 58%)',
  interactiveGlow: 'rgb(200 160 80)',
} as const;

export const typography = {
  display: {
    font: 'Cormorant Garamond',
    weights: [300, 400] as const,
    usage: 'Room titles only',
  },
  body: {
    font: '-apple-system, BlinkMacSystemFont, SF Pro Text, SF Compact Text, system-ui',
    weights: [300, 400, 500, 600] as const,
    usage: 'All UI text, labels, controls',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  default: '1.5rem',
  lg: '1.5rem',
  md: 'calc(1.5rem - 2px)',
  sm: 'calc(1.5rem - 4px)',
} as const;

export const animation = {
  easing: EASING,
  duration: DURATION,
  lightAnimation: LIGHT_ANIMATION,
  pollInterval: POLL_INTERVAL,
  blockingWindow: BLOCKING_WINDOW,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
