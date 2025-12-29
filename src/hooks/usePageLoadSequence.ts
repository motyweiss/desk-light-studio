import { useState, useEffect, useCallback, useRef } from 'react';
import { TIMING, EASE } from '@/lib/animations';

/**
 * Simplified Load Stages:
 * 1. 'loading'  - Initial state, showing overlay
 * 2. 'entering' - Overlay exiting, content fading in
 * 3. 'ready'    - Content visible, data loaded
 */
export type LoadStage = 'loading' | 'entering' | 'ready';

// Timing constants (in seconds for framer-motion)
export const LOAD_TIMING = {
  overlayExit: 0.5,
  contentEntry: 0.6,
  contentDelay: 0.1,
  crossfade: 0.4,
  minSkeleton: 0.3,
} as const;

// Easing curves
export const LOAD_EASE = {
  overlay: EASE.gentle,
  content: [0.22, 0.68, 0.35, 1.0] as const, // Smooth organic
} as const;

interface UsePageLoadSequenceOptions {
  overlayComplete: boolean;
  isConnected: boolean;
  isDataLoaded: boolean;
}

interface UsePageLoadSequenceResult {
  stage: LoadStage;
  showContent: boolean;
  showSkeleton: boolean;
  showData: boolean;
  isComplete: boolean;
  onOverlayExitComplete: () => void;
}

export const usePageLoadSequence = ({
  overlayComplete,
  isConnected,
  isDataLoaded,
}: UsePageLoadSequenceOptions): UsePageLoadSequenceResult => {
  const [stage, setStage] = useState<LoadStage>('loading');
  const hasShownData = useRef(false);
  const enteredAtRef = useRef<number | null>(null);

  // When overlay finishes loading, start exit
  useEffect(() => {
    if (overlayComplete && stage === 'loading') {
      setStage('entering');
      enteredAtRef.current = Date.now();
    }
  }, [overlayComplete, stage]);

  // Handle transition to ready state
  useEffect(() => {
    if (stage !== 'entering' || hasShownData.current) return;

    const dataReady = isConnected && isDataLoaded;
    
    // Calculate minimum skeleton time
    const enteredAt = enteredAtRef.current || Date.now();
    const elapsed = (Date.now() - enteredAt) / 1000;
    const remaining = Math.max(0, LOAD_TIMING.minSkeleton - elapsed);

    // Transition to ready after minimum skeleton time
    const timer = setTimeout(() => {
      hasShownData.current = true;
      setStage('ready');
    }, dataReady ? remaining * 1000 : LOAD_TIMING.minSkeleton * 1000 + 200);

    return () => clearTimeout(timer);
  }, [stage, isConnected, isDataLoaded]);

  const onOverlayExitComplete = useCallback(() => {
    // No-op, transitions handled by useEffect
  }, []);

  // Derived states
  const showContent = stage === 'entering' || stage === 'ready';
  const showSkeleton = stage === 'entering' && !hasShownData.current;
  const showData = hasShownData.current || stage === 'ready';

  return {
    stage,
    showContent,
    showSkeleton,
    showData,
    isComplete: stage === 'ready',
    onOverlayExitComplete,
  };
};
