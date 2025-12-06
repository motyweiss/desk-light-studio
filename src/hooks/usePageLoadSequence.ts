import { useState, useEffect, useCallback, useRef } from 'react';

export type LoadPhase = 
  | 'initial'      // Loading overlay visible
  | 'overlay-exit' // Overlay fading out
  | 'content'      // Content fading in
  | 'stagger'      // Staggered elements entering
  | 'complete';    // All animations complete

interface UsePageLoadSequenceOptions {
  /** Whether the overlay has finished loading */
  overlayComplete: boolean;
  /** Whether HA connection is established */
  isConnected: boolean;
  /** Whether data has been loaded */
  isDataLoaded: boolean;
}

interface UsePageLoadSequenceResult {
  /** Current animation phase */
  phase: LoadPhase;
  /** Whether content container should be visible */
  showContent: boolean;
  /** Whether to show skeleton loading states */
  showSkeleton: boolean;
  /** Whether real data should be displayed */
  showData: boolean;
  /** Get stagger delay for element at index */
  getStaggerDelay: (index: number, baseDelay?: number) => number;
  /** Whether initial page load animation is complete */
  isInitialLoadComplete: boolean;
  /** Mark content ready (called after overlay exit) */
  markContentReady: () => void;
}

// Centralized timing constants (in seconds)
export const LOAD_TIMING = {
  // Overlay exit
  overlayFade: 0.5,
  
  // Content entry (after overlay)
  contentFadeDelay: 0.05,
  contentFadeDuration: 0.5,
  
  // Stagger timing
  staggerBase: 0.08,
  staggerStart: 0.1,
  
  // Skeleton to data transition
  skeletonMinTime: 400, // ms
  skeletonFadeOut: 0.4,
  dataFadeIn: 0.5,
  dataFadeDelay: 0.15,
  
  // Smooth easing curves
  ease: {
    smooth: [0.25, 0.1, 0.25, 1] as const,
    entrance: [0.22, 0.03, 0.26, 1] as const,
    gentle: [0.16, 0.1, 0.3, 1] as const,
  },
} as const;

export const usePageLoadSequence = (
  options: UsePageLoadSequenceOptions
): UsePageLoadSequenceResult => {
  const { overlayComplete, isConnected, isDataLoaded } = options;
  
  const [phase, setPhase] = useState<LoadPhase>('initial');
  const [contentReady, setContentReady] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showData, setShowData] = useState(false);
  
  const skeletonStartRef = useRef<number>(Date.now());
  const hasTransitionedToData = useRef(false);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any pending timeouts
  const clearTimeouts = useCallback(() => {
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
  }, []);

  // Mark content as ready (called from overlay exit complete)
  const markContentReady = useCallback(() => {
    setContentReady(true);
    setPhase('content');
    
    // Move to stagger phase after content fade starts
    phaseTimeoutRef.current = setTimeout(() => {
      setPhase('stagger');
    }, LOAD_TIMING.contentFadeDuration * 500);
  }, []);

  // Handle overlay completion
  useEffect(() => {
    if (overlayComplete && phase === 'initial') {
      setPhase('overlay-exit');
    }
  }, [overlayComplete, phase]);

  // Handle data ready transition
  useEffect(() => {
    if (!isConnected || !isDataLoaded || hasTransitionedToData.current) {
      return;
    }

    // Calculate remaining skeleton time
    const skeletonShownFor = Date.now() - skeletonStartRef.current;
    const remainingTime = Math.max(0, LOAD_TIMING.skeletonMinTime - skeletonShownFor);

    // Transition skeleton to data with smooth timing
    phaseTimeoutRef.current = setTimeout(() => {
      hasTransitionedToData.current = true;
      setShowSkeleton(false);
      
      // Small delay before showing data for crossfade effect
      setTimeout(() => {
        setShowData(true);
        setPhase('complete');
      }, LOAD_TIMING.dataFadeDelay * 1000);
    }, remainingTime);

    return clearTimeouts;
  }, [isConnected, isDataLoaded, clearTimeouts]);

  // Reset skeleton start time when connection drops
  useEffect(() => {
    if (!isConnected && hasTransitionedToData.current) {
      // Connection lost after having data - keep showing data
      return;
    }
    if (!isConnected) {
      skeletonStartRef.current = Date.now();
      hasTransitionedToData.current = false;
    }
  }, [isConnected]);

  // Calculate stagger delay for indexed elements
  const getStaggerDelay = useCallback((index: number, baseDelay: number = LOAD_TIMING.staggerStart) => {
    if (!contentReady) return 0;
    return baseDelay + (index * LOAD_TIMING.staggerBase);
  }, [contentReady]);

  return {
    phase,
    showContent: contentReady,
    showSkeleton: showSkeleton && !showData,
    showData,
    getStaggerDelay,
    isInitialLoadComplete: phase === 'complete',
    markContentReady,
  };
};
