import { useState, useEffect, useCallback, useRef } from 'react';
import { LOAD_SEQUENCE, LoadStage } from '@/constants/loadingSequence';

// Re-export for backward compatibility
export { LOAD_SEQUENCE as LOAD_TIMING };
export type { LoadStage };

// Export commonly used values for direct access
export const LOAD_EASE = {
  overlay: LOAD_SEQUENCE.spinner.exitEase,
  content: LOAD_SEQUENCE.content.ease,
  header: LOAD_SEQUENCE.header.ease,
} as const;

interface UsePageLoadSequenceOptions {
  /** Whether the initial overlay/spinner is complete */
  overlayComplete: boolean;
  /** Whether the app is connected to data source */
  isConnected: boolean;
  /** Whether the data has been loaded */
  isDataLoaded: boolean;
}

interface UsePageLoadSequenceResult {
  /** Current loading stage */
  stage: LoadStage;
  /** Whether to show the loading overlay */
  showOverlay: boolean;
  /** Whether header should be visible */
  showHeader: boolean;
  /** Whether main content should be visible */
  showContent: boolean;
  /** Whether to show skeleton states */
  showSkeleton: boolean;
  /** Whether real data should be displayed */
  showData: boolean;
  /** Whether media player should be visible */
  showMediaPlayer: boolean;
  /** Whether the entire load sequence is complete */
  isComplete: boolean;
  /** Callback for when overlay exit animation completes */
  onOverlayExitComplete: () => void;
  /** Get delay for a specific element */
  getElementDelay: (element: keyof typeof LOAD_SEQUENCE.elements) => number;
}

export const usePageLoadSequence = ({
  overlayComplete,
  isConnected,
  isDataLoaded,
}: UsePageLoadSequenceOptions): UsePageLoadSequenceResult => {
  const [stage, setStage] = useState<LoadStage>('spinner');
  const stageStartTimeRef = useRef<number>(Date.now());
  const hasShownDataRef = useRef(false);

  // Stage transitions
  useEffect(() => {
    if (stage === 'spinner' && overlayComplete) {
      // Transition to exiting
      setStage('exiting');
      stageStartTimeRef.current = Date.now();
    }
  }, [stage, overlayComplete]);

  useEffect(() => {
    if (stage === 'exiting') {
      // After exit animation, start entering
      const timer = setTimeout(() => {
        setStage('entering');
        stageStartTimeRef.current = Date.now();
      }, LOAD_SEQUENCE.spinner.exitDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'entering') {
      // Move to hydrating after content has entered
      const timer = setTimeout(() => {
        setStage('hydrating');
        stageStartTimeRef.current = Date.now();
      }, (LOAD_SEQUENCE.content.delay + LOAD_SEQUENCE.content.duration) * 1000);

      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage !== 'hydrating' || hasShownDataRef.current) return;

    const dataReady = isConnected && isDataLoaded;
    
    // Calculate minimum skeleton display time
    const elapsed = (Date.now() - stageStartTimeRef.current) / 1000;
    const remaining = Math.max(0, LOAD_SEQUENCE.skeleton.minDisplayTime - elapsed);

    const timer = setTimeout(() => {
      if (dataReady) {
        hasShownDataRef.current = true;
        setStage('ready');
      }
    }, remaining * 1000);

    return () => clearTimeout(timer);
  }, [stage, isConnected, isDataLoaded]);

  // Force ready after a maximum wait time
  useEffect(() => {
    if (stage === 'hydrating') {
      const maxWait = setTimeout(() => {
        if (!hasShownDataRef.current) {
          hasShownDataRef.current = true;
          setStage('ready');
        }
      }, 3000); // Max 3 seconds in hydrating state

      return () => clearTimeout(maxWait);
    }
  }, [stage]);

  const onOverlayExitComplete = useCallback(() => {
    // Transitions are now handled by timers, this is for additional cleanup if needed
  }, []);

  const getElementDelay = useCallback((element: keyof typeof LOAD_SEQUENCE.elements): number => {
    const config = LOAD_SEQUENCE.elements[element];
    return LOAD_SEQUENCE.content.delay + config.delay;
  }, []);

  // Derived visibility states
  const showOverlay = stage === 'spinner';
  const showHeader = stage !== 'spinner';
  const showContent = stage === 'entering' || stage === 'hydrating' || stage === 'ready';
  const showSkeleton = (stage === 'entering' || stage === 'hydrating') && !hasShownDataRef.current;
  const showData = hasShownDataRef.current || stage === 'ready';
  const showMediaPlayer = stage === 'entering' || stage === 'hydrating' || stage === 'ready';
  const isComplete = stage === 'ready';

  return {
    stage,
    showOverlay,
    showHeader,
    showContent,
    showSkeleton,
    showData,
    showMediaPlayer,
    isComplete,
    onOverlayExitComplete,
    getElementDelay,
  };
};
