/**
 * Animation System
 * 
 * Centralized animation exports for the entire application.
 * Import from this file for consistent, coordinated animations.
 */

// Core tokens
export {
  TIMING,
  EASE,
  STAGGER,
  DELAY,
  TRANSITIONS,
  SPRINGS,
  SEQUENCES,
  type TimingKey,
  type EaseKey,
  type StaggerKey,
  type TransitionKey,
  type SpringKey,
  type SequenceKey,
} from './tokens';

// Presets
export {
  MOTION_PRESETS,
  INTERACTION_PRESETS,
  VARIANTS,
  LOADING_PRESETS,
  AMBIENT_PRESETS,
  createStaggerProps,
  withDelay,
  getReducedMotionTransition,
  createCrossfadeProps,
} from './presets';
