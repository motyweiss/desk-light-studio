import { useState, useEffect, useRef } from 'react';

type ConnectionPhase = 'disconnected' | 'connecting' | 'fetching' | 'ready';

interface ConnectionTransitionOptions {
  /** Delay before showing skeleton (prevents flash for fast connections) */
  skeletonDelay?: number;
  /** Delay before transitioning from fetching to ready */
  dataReadyDelay?: number;
  /** Minimum time to show skeleton (prevents jarring quick flashes) */
  minSkeletonTime?: number;
}

interface ConnectionTransitionResult {
  /** Current display phase for UI */
  displayPhase: ConnectionPhase;
  /** Whether to show skeleton loading states */
  showSkeleton: boolean;
  /** Whether data is ready to display */
  dataReady: boolean;
  /** Whether currently in any loading state */
  isLoading: boolean;
}

/**
 * Hook to manage smooth transitions between connection states
 * Prevents jarring UI changes when connection status changes
 */
export const useConnectionTransition = (
  isConnected: boolean,
  isDataLoaded: boolean,
  options: ConnectionTransitionOptions = {}
): ConnectionTransitionResult => {
  const {
    skeletonDelay = 100,
    dataReadyDelay = 300,
    minSkeletonTime = 400,
  } = options;

  const [displayPhase, setDisplayPhase] = useState<ConnectionPhase>('disconnected');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const skeletonStartTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!isConnected) {
      // Not connected - show placeholder data immediately
      setDisplayPhase('disconnected');
      setShowSkeleton(false);
      skeletonStartTimeRef.current = null;
      return;
    }

    if (isConnected && !isDataLoaded) {
      // Connected but waiting for data
      setDisplayPhase('fetching');
      
      // Start skeleton after small delay to prevent flash
      timeoutRef.current = setTimeout(() => {
        setShowSkeleton(true);
        skeletonStartTimeRef.current = Date.now();
      }, skeletonDelay);
      return;
    }

    if (isConnected && isDataLoaded) {
      // Data is loaded - transition to ready
      const skeletonShownFor = skeletonStartTimeRef.current 
        ? Date.now() - skeletonStartTimeRef.current 
        : minSkeletonTime;
      
      const remainingSkeletonTime = Math.max(0, minSkeletonTime - skeletonShownFor);
      
      // Ensure skeleton is shown for minimum time to prevent jarring flash
      timeoutRef.current = setTimeout(() => {
        setShowSkeleton(false);
        
        // Small delay before marking as ready for smooth transition
        setTimeout(() => {
          setDisplayPhase('ready');
          skeletonStartTimeRef.current = null;
        }, dataReadyDelay);
      }, remainingSkeletonTime);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isConnected, isDataLoaded, skeletonDelay, dataReadyDelay, minSkeletonTime]);

  return {
    displayPhase,
    showSkeleton,
    dataReady: displayPhase === 'ready' || (!isConnected && displayPhase === 'disconnected'),
    isLoading: showSkeleton || displayPhase === 'connecting' || displayPhase === 'fetching',
  };
};
