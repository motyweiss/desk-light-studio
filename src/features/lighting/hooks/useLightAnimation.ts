import { useCallback, useRef, useState } from 'react';
import { useMotionValue, animate, type Easing } from 'framer-motion';
import { TIMING, EASE, SEQUENCES } from '@/lib/animations';

export type AnimationSource = 'initial' | 'user' | 'external';

interface UseLightAnimationOptions {
  initialValue?: number;
  onAnimationComplete?: () => void;
}

export const useLightAnimation = (
  lightId: string,
  options: UseLightAnimationOptions = {}
) => {
  const { initialValue = 0, onAnimationComplete } = options;
  
  // Core animation state
  const displayValue = useMotionValue(initialValue);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Track targets and sources
  const targetRef = useRef(initialValue);
  const sourceRef = useRef<AnimationSource>('initial');
  const animationControlRef = useRef<any>(null);

  const animateTo = useCallback((
    target: number,
    source: AnimationSource,
    options?: { immediate?: boolean; force?: boolean }
  ) => {
    const currentValue = displayValue.get();
    
    // Cancel any existing animation if forced or different target
    if (options?.force || targetRef.current !== target) {
      if (animationControlRef.current) {
        animationControlRef.current.stop();
        animationControlRef.current = null;
      }
    }

    targetRef.current = target;
    sourceRef.current = source;

    // Immediate update - no animation
    if (options?.immediate) {
      displayValue.set(target);
      setIsAnimating(false);
      return;
    }

    const diff = Math.abs(currentValue - target);
    
    // Determine animation config based on context using centralized tokens
    let duration: number;
    let ease: Easing;
    
    if (source === 'external') {
      // External changes from other apps/devices - smooth, quick animation
      if (diff < 5) {
        // Tiny change - snap immediately
        displayValue.set(target);
        setIsAnimating(false);
        return;
      } else {
        // Visible change - smooth short animation
        duration = SEQUENCES.lightControl.externalSyncDuration;
        ease = EASE.smooth as Easing;
      }
    } else if (source === 'user') {
      const isOn = target > 0;
      const wasOn = currentValue > 0;
      
      if (isOn !== wasOn) {
        // Toggle on/off - full dramatic animation
        duration = isOn ? SEQUENCES.lightControl.turnOnDuration : SEQUENCES.lightControl.turnOffDuration;
        ease = EASE.entrance as Easing;
      } else {
        // Slider adjustment - responsive animation
        duration = SEQUENCES.lightControl.sliderDuration;
        ease = EASE.snappy as Easing;
      }
    } else {
      // Initial load - no animation
      displayValue.set(target);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    
    animationControlRef.current = animate(currentValue, target, {
      duration,
      ease,
      onUpdate: (latest) => displayValue.set(latest),
      onComplete: () => {
        setIsAnimating(false);
        animationControlRef.current = null;
        onAnimationComplete?.();
      },
    });
  }, [displayValue, onAnimationComplete]);

  const getCurrentValue = useCallback(() => displayValue.get(), [displayValue]);
  const getTarget = useCallback(() => targetRef.current, []);
  const getSource = useCallback(() => sourceRef.current, []);

  return {
    displayValue,
    isAnimating,
    animateTo,
    getCurrentValue,
    getTarget,
    getSource,
  };
};
