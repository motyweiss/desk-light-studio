import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Unified Load Stages:
 * 1. 'loading'   - Overlay visible, preloading images
 * 2. 'exiting'   - Overlay fading out (user can't interact yet)
 * 3. 'entering'  - Content containers fading in (skeleton visible)
 * 4. 'hydrating' - Data arrived, crossfading skeleton to real data
 * 5. 'complete'  - All animations done
 */
export type LoadStage = 
  | 'loading'
  | 'exiting'
  | 'entering'
  | 'hydrating'
  | 'complete';

// ============================================================
// CENTRALIZED TIMING CONSTANTS (in milliseconds)
// ============================================================
export const LOAD_TIMING = {
  // Overlay phase
  minPreloadTime: 400,        // Minimum time to show overlay
  overlayExitDuration: 500,   // Overlay fade out duration
  
  // Content entry phase (after overlay gone)
  contentEntryDelay: 50,      // Small delay after overlay before content
  contentEntryDuration: 500,  // How long content fades in
  
  // Element stagger timing
  stagger: {
    base: 60,                 // Base stagger between elements (ms)
    header: 0,                // Header enters first
    devices: 100,             // Devices section delay
    lightCards: 160,          // Light cards delay
    deskImage: 80,            // Desk image delay
  },
  
  // Data hydration phase
  minSkeletonTime: 500,       // Minimum time to show skeleton
  crossfadeDuration: 500,     // Skeleton to data crossfade
  crossfadeBlur: 4,           // Blur pixels during transition
  
  // Post-hydration effects
  progressRingDelay: 200,     // Delay before progress rings animate
  glowLayerDelay: 300,        // Delay before glow layers appear
} as const;

// Convert to seconds for framer-motion
export const LOAD_TIMING_SECONDS = {
  overlayExitDuration: LOAD_TIMING.overlayExitDuration / 1000,
  contentEntryDelay: LOAD_TIMING.contentEntryDelay / 1000,
  contentEntryDuration: LOAD_TIMING.contentEntryDuration / 1000,
  crossfadeDuration: LOAD_TIMING.crossfadeDuration / 1000,
  stagger: {
    base: LOAD_TIMING.stagger.base / 1000,
    header: LOAD_TIMING.stagger.header / 1000,
    devices: LOAD_TIMING.stagger.devices / 1000,
    lightCards: LOAD_TIMING.stagger.lightCards / 1000,
    deskImage: LOAD_TIMING.stagger.deskImage / 1000,
  },
  progressRingDelay: LOAD_TIMING.progressRingDelay / 1000,
  glowLayerDelay: LOAD_TIMING.glowLayerDelay / 1000,
} as const;

interface UsePageLoadSequenceOptions {
  /** Whether the overlay has finished (images preloaded) */
  overlayComplete: boolean;
  /** Whether HA connection is established */
  isConnected: boolean;
  /** Whether climate/sensor data has been loaded */
  isDataLoaded: boolean;
}

interface UsePageLoadSequenceResult {
  /** Current load stage */
  stage: LoadStage;
  /** Whether content container should be visible */
  showContent: boolean;
  /** Whether to show skeleton loading states */
  showSkeleton: boolean;
  /** Whether real data should be displayed */
  showData: boolean;
  /** Get stagger delay for element at index (in seconds) */
  getStaggerDelay: (index: number, baseDelayMs?: number) => number;
  /** Whether initial page load is complete */
  isComplete: boolean;
  /** Mark that overlay has finished exiting */
  onOverlayExitComplete: () => void;
}

export const usePageLoadSequence = (
  options: UsePageLoadSequenceOptions
): UsePageLoadSequenceResult => {
  const { overlayComplete, isConnected, isDataLoaded } = options;
  
  const [stage, setStage] = useState<LoadStage>('loading');
  const skeletonStartRef = useRef<number>(Date.now());
  const hasTransitionedToData = useRef(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Clear all pending timeouts
  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  // Add a timeout and track it
  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const id = setTimeout(callback, delay);
    timeoutRefs.current.push(id);
    return id;
  }, []);

  // Called when overlay animation finishes
  const onOverlayExitComplete = useCallback(() => {
    if (stage !== 'exiting') return;
    
    // Move to entering phase
    setStage('entering');
    
    // After content has entered, check if we should hydrate
    addTimeout(() => {
      // If we already have data, go straight to hydrating
      if (isConnected && isDataLoaded && !hasTransitionedToData.current) {
        const skeletonShown = Date.now() - skeletonStartRef.current;
        const remaining = Math.max(0, LOAD_TIMING.minSkeletonTime - skeletonShown);
        
        addTimeout(() => {
          hasTransitionedToData.current = true;
          setStage('hydrating');
          
          addTimeout(() => {
            setStage('complete');
          }, LOAD_TIMING.crossfadeDuration);
        }, remaining);
      }
    }, LOAD_TIMING.contentEntryDuration);
  }, [stage, isConnected, isDataLoaded, addTimeout]);

  // Handle overlay becoming complete (images loaded)
  useEffect(() => {
    if (overlayComplete && stage === 'loading') {
      setStage('exiting');
    }
  }, [overlayComplete, stage]);

  // Handle data becoming ready OR timeout to proceed without HA connection
  useEffect(() => {
    if (hasTransitionedToData.current || stage !== 'entering') {
      return;
    }

    // If connected and data loaded, proceed immediately
    // Otherwise, use a short timeout to show content anyway
    const shouldProceed = isConnected && isDataLoaded;
    const timeoutDelay = shouldProceed ? 0 : 300; // Show content after 300ms even without HA

    const skeletonShown = Date.now() - skeletonStartRef.current;
    const remaining = Math.max(timeoutDelay, LOAD_TIMING.minSkeletonTime - skeletonShown);

    addTimeout(() => {
      hasTransitionedToData.current = true;
      setStage('hydrating');
      
      addTimeout(() => {
        setStage('complete');
      }, LOAD_TIMING.crossfadeDuration);
    }, remaining);

    return clearTimeouts;
  }, [isConnected, isDataLoaded, stage, addTimeout, clearTimeouts]);

  // Reset skeleton timer when connection drops
  useEffect(() => {
    if (!isConnected && hasTransitionedToData.current) {
      // Connection lost after having data - keep showing data
      return;
    }
    if (!isConnected && stage !== 'loading' && stage !== 'exiting') {
      skeletonStartRef.current = Date.now();
    }
  }, [isConnected, stage]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimeouts;
  }, [clearTimeouts]);

  // Calculate stagger delay for indexed elements
  const getStaggerDelay = useCallback((index: number, baseDelayMs: number = 0) => {
    return (baseDelayMs + (index * LOAD_TIMING.stagger.base)) / 1000;
  }, []);

  // Derived state - mutually exclusive skeleton/data states
  const showContent = stage === 'entering' || stage === 'hydrating' || stage === 'complete';
  const showSkeleton = stage === 'entering' && !hasTransitionedToData.current;
  const showData = hasTransitionedToData.current || stage === 'hydrating' || stage === 'complete';

  return {
    stage,
    showContent,
    showSkeleton,
    showData,
    getStaggerDelay,
    isComplete: stage === 'complete',
    onOverlayExitComplete,
  };
};
