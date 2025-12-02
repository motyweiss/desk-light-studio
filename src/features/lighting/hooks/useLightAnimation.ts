import { useCallback, useRef, useState } from 'react';
import { useMotionValue, animate } from 'framer-motion';
import { LIGHT_ANIMATION, type AnimationSource } from '@/constants/animations';

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
    
    // Determine animation config based on context
    let config;
    
    if (source === 'external') {
      // External changes from other apps/devices - smooth, quick animation
      if (diff < 5) {
        // Tiny change - snap immediately
        displayValue.set(target);
        setIsAnimating(false);
        return;
      } else {
        // Visible change - smooth short animation
        config = { 
          duration: 0.4, 
          ease: LIGHT_ANIMATION.slider.ease 
        };
      }
    } else if (source === 'user') {
      const isOn = target > 0;
      const wasOn = currentValue > 0;
      
      if (isOn !== wasOn) {
        // Toggle on/off - full dramatic animation
        config = isOn ? LIGHT_ANIMATION.turnOn : LIGHT_ANIMATION.turnOff;
      } else {
        // Slider adjustment - responsive animation
        config = LIGHT_ANIMATION.slider;
      }
    } else {
      // Initial load - no animation
      displayValue.set(target);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    
    animationControlRef.current = animate(displayValue, target, {
      ...config,
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
