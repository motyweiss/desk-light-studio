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

  // Start with skeleton showing until we have real data
  const [displayPhase, setDisplayPhase] = useState<ConnectionPhase>('connecting');
  const [showSkeleton, setShowSkeleton] = useState(true);
  const skeletonStartTimeRef = useRef<number | null>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasEverConnected = useRef(false);

  useEffect(() => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Track if we've ever connected
    if (isConnected) {
      hasEverConnected.current = true;
    }

    if (!isConnected) {
      // Not connected yet - show skeleton/loading state
      if (!hasEverConnected.current) {
        // Never connected - show skeleton while waiting
        setDisplayPhase('connecting');
        setShowSkeleton(true);
        if (!skeletonStartTimeRef.current) {
          skeletonStartTimeRef.current = Date.now();
        }
      } else {
        // Was connected before, now disconnected - keep showing data
        setDisplayPhase('disconnected');
        setShowSkeleton(false);
      }
      return;
    }

    if (isConnected && !isDataLoaded) {
      // Connected but waiting for data
      setDisplayPhase('fetching');
      
      // Start skeleton after small delay to prevent flash
      timeoutRef.current = setTimeout(() => {
        setShowSkeleton(true);
        if (!skeletonStartTimeRef.current) {
          skeletonStartTimeRef.current = Date.now();
        }
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
    // Only ready when we have real data from connection
    dataReady: displayPhase === 'ready',
    isLoading: showSkeleton || displayPhase === 'connecting' || displayPhase === 'fetching',
  };
};
