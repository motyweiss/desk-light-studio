import { useCallback, useRef, useState, useEffect } from 'react';
import { useMotionValue, animate, type AnimationPlaybackControls, type Easing } from 'framer-motion';
import { TIMING, EASE } from '@/lib/animations';
import { useReducedMotion } from './useReducedMotion';

/**
 * Animation source types for priority handling
 */
export type AnimationSource = 
  | 'initial'   // Initial load - no animation
  | 'user'      // User interaction - highest priority
  | 'external'  // External state sync - smooth transition
  | 'system';   // System-triggered - medium priority

/**
 * Options for animated value
 */
interface UseAnimatedValueOptions {
  /** Initial value */
  initialValue?: number;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Identifier for debugging */
  id?: string;
}

/**
 * Configuration for animateTo
 */
interface AnimateToConfig {
  /** Skip animation, set immediately */
  immediate?: boolean;
  /** Force animation even if same target */
  force?: boolean;
  /** Custom duration override */
  duration?: number;
  /** Custom easing override */
  ease?: Easing;
}

/**
 * Unified hook for animating numeric values
 * 
 * Handles:
 * - Animation source priority (user > system > external)
 * - Cancellation of conflicting animations
 * - Reduced motion support
 * - Smooth external sync
 */
export const useAnimatedValue = (options: UseAnimatedValueOptions = {}) => {
  const { initialValue = 0, onComplete, id } = options;
  
  const reducedMotion = useReducedMotion();
  
  // Core motion value
  const motionValue = useMotionValue(initialValue);
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs for tracking
  const targetRef = useRef(initialValue);
  const sourceRef = useRef<AnimationSource>('initial');
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const lastUserInteractionRef = useRef<number>(0);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  /**
   * Cancel any running animation
   */
  const cancel = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  /**
   * Animate to a target value
   */
  const animateTo = useCallback((
    target: number,
    source: AnimationSource,
    config?: AnimateToConfig
  ) => {
    const currentValue = motionValue.get();
    const currentTarget = targetRef.current;
    
    // Skip if already at target (unless forced)
    if (!config?.force && Math.abs(target - currentTarget) < 0.1 && !isAnimating) {
      return;
    }
    
    // Priority handling: user interactions take precedence
    if (source === 'external') {
      const timeSinceUserInteraction = Date.now() - lastUserInteractionRef.current;
      // Block external updates for 500ms after user interaction
      if (timeSinceUserInteraction < 500) {
        return;
      }
    }
    
    // Track user interaction time
    if (source === 'user') {
      lastUserInteractionRef.current = Date.now();
    }
    
    // Cancel existing animation
    cancel();
    
    // Update refs
    targetRef.current = target;
    sourceRef.current = source;
    
    // Immediate mode - no animation
    if (config?.immediate || reducedMotion) {
      motionValue.set(target);
      onComplete?.();
      return;
    }
    
    const diff = Math.abs(currentValue - target);
    
    // Determine animation config
    let duration: number;
    let ease: Easing;
    
    if (config?.duration !== undefined) {
      duration = config.duration;
      ease = config.ease ?? EASE.smooth as Easing;
    } else if (source === 'initial') {
      // Initial - no animation
      motionValue.set(target);
      onComplete?.();
      return;
    } else if (source === 'external') {
      // External sync - quick, smooth
      if (diff < 5) {
        // Tiny change - snap
        motionValue.set(target);
        onComplete?.();
        return;
      }
      duration = TIMING.medium;
      ease = EASE.smooth as Easing;
    } else if (source === 'user') {
      // User interaction
      const isToggle = (currentValue === 0 && target > 0) || (currentValue > 0 && target === 0);
      if (isToggle) {
        // Toggle on/off - dramatic
        duration = target > 0 ? TIMING.dramatic : TIMING.slow;
        ease = EASE.entrance as Easing;
      } else {
        // Slider adjustment - responsive
        duration = TIMING.fast;
        ease = EASE.snappy as Easing;
      }
    } else {
      // System - standard
      duration = TIMING.medium;
      ease = EASE.smooth as Easing;
    }
    
    setIsAnimating(true);
    
    controlsRef.current = animate(currentValue, target, {
      duration,
      ease,
      onUpdate: (latest) => motionValue.set(latest),
      onComplete: () => {
        setIsAnimating(false);
        controlsRef.current = null;
        onComplete?.();
      },
    });
  }, [motionValue, isAnimating, reducedMotion, onComplete, cancel]);

  /**
   * Set value immediately without animation
   */
  const set = useCallback((value: number) => {
    cancel();
    targetRef.current = value;
    motionValue.set(value);
  }, [motionValue, cancel]);

  /**
   * Get current animated value
   */
  const get = useCallback(() => motionValue.get(), [motionValue]);

  /**
   * Get target value
   */
  const getTarget = useCallback(() => targetRef.current, []);

  /**
   * Get current animation source
   */
  const getSource = useCallback(() => sourceRef.current, []);

  return {
    /** The motion value for binding to Framer Motion */
    motionValue,
    /** Whether animation is currently running */
    isAnimating,
    /** Animate to a target value */
    animateTo,
    /** Set value immediately */
    set,
    /** Get current value */
    get,
    /** Get target value */
    getTarget,
    /** Get animation source */
    getSource,
    /** Cancel running animation */
    cancel,
  };
};

export type UseAnimatedValueReturn = ReturnType<typeof useAnimatedValue>;
