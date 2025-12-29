import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef, type ReactNode } from 'react';
import { TIMING, STAGGER, DELAY, SEQUENCES } from '@/lib/animations';
import { useReducedMotion } from './useReducedMotion';

/**
 * Animation stage types
 */
export type AnimationStage = 
  | 'loading'     // Initial loading state
  | 'exiting'     // Overlay exiting
  | 'entering'    // Content entering
  | 'hydrating'   // Data loading
  | 'ready';      // Fully loaded

/**
 * Sequence registration
 */
interface SequenceState {
  stage: AnimationStage;
  startTime: number;
  completedStages: Set<AnimationStage>;
}

/**
 * Animation orchestrator context value
 */
interface AnimationOrchestratorContextValue {
  /** Current animation stage */
  stage: AnimationStage;
  /** Whether reduced motion is preferred */
  reducedMotion: boolean;
  /** Whether content should be visible */
  showContent: boolean;
  /** Whether data should be visible (skeleton → data transition) */
  showData: boolean;
  /** Get stagger delay for an element */
  getStaggerDelay: (index: number, group?: string) => number;
  /** Get duration multiplier (0 for reduced motion, 1 otherwise) */
  getDurationMultiplier: () => number;
  /** Check if a stage has been completed */
  isStageComplete: (stage: AnimationStage) => boolean;
  /** Advance to next stage */
  advanceStage: (to: AnimationStage) => void;
  /** Mark stage as complete */
  markStageComplete: (stage: AnimationStage) => void;
  /** Get time since stage started */
  getStageElapsed: () => number;
}

const AnimationOrchestratorContext = createContext<AnimationOrchestratorContextValue | null>(null);

/**
 * Animation orchestrator provider props
 */
interface AnimationOrchestratorProviderProps {
  children: ReactNode;
  /** Initial stage (default: 'loading') */
  initialStage?: AnimationStage;
  /** Whether data is loaded */
  isDataLoaded?: boolean;
  /** Whether connection is established */
  isConnected?: boolean;
}

/**
 * Animation Orchestrator Provider
 * 
 * Coordinates all animations in the application:
 * - Manages animation stages (loading → entering → hydrating → ready)
 * - Provides stagger timing utilities
 * - Handles reduced motion preference
 * - Ensures animations don't conflict
 */
export const AnimationOrchestratorProvider: React.FC<AnimationOrchestratorProviderProps> = ({
  children,
  initialStage = 'loading',
  isDataLoaded = false,
  isConnected = false,
}) => {
  const reducedMotion = useReducedMotion();
  
  const [state, setState] = useState<SequenceState>({
    stage: initialStage,
    startTime: Date.now(),
    completedStages: new Set(),
  });
  
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Cleanup timers
  useEffect(() => {
    return () => {
      if (stageTimerRef.current) {
        clearTimeout(stageTimerRef.current);
      }
    };
  }, []);
  
  // Auto-advance from hydrating to ready when data is loaded
  useEffect(() => {
    if (state.stage === 'hydrating' && isDataLoaded && isConnected) {
      const delay = reducedMotion ? 0 : SEQUENCES.pageLoad.hydrationDelay * 1000;
      
      stageTimerRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          stage: 'ready',
          completedStages: new Set([...prev.completedStages, 'hydrating']),
        }));
      }, delay);
    }
  }, [state.stage, isDataLoaded, isConnected, reducedMotion]);

  const advanceStage = useCallback((to: AnimationStage) => {
    setState(prev => ({
      stage: to,
      startTime: Date.now(),
      completedStages: new Set([...prev.completedStages, prev.stage]),
    }));
  }, []);

  const markStageComplete = useCallback((stage: AnimationStage) => {
    setState(prev => ({
      ...prev,
      completedStages: new Set([...prev.completedStages, stage]),
    }));
  }, []);

  const isStageComplete = useCallback((stage: AnimationStage) => {
    return state.completedStages.has(stage);
  }, [state.completedStages]);

  const getStageElapsed = useCallback(() => {
    return Date.now() - state.startTime;
  }, [state.startTime]);

  const getStaggerDelay = useCallback((index: number, group?: string) => {
    if (reducedMotion) return 0;
    
    // Different stagger values for different groups
    const staggerValue = group === 'controls' ? STAGGER.tight :
                         group === 'cards' ? STAGGER.normal :
                         group === 'climate' ? STAGGER.relaxed :
                         STAGGER.normal;
    
    // Add base delay based on current stage
    const baseDelay = state.stage === 'entering' ? DELAY.pageContent : 0;
    
    return baseDelay + (index * staggerValue);
  }, [reducedMotion, state.stage]);

  const getDurationMultiplier = useCallback(() => {
    return reducedMotion ? 0 : 1;
  }, [reducedMotion]);

  // Derived state
  const showContent = state.stage !== 'loading';
  const showData = state.stage === 'ready' || state.stage === 'hydrating';

  const value = useMemo<AnimationOrchestratorContextValue>(() => ({
    stage: state.stage,
    reducedMotion,
    showContent,
    showData,
    getStaggerDelay,
    getDurationMultiplier,
    isStageComplete,
    advanceStage,
    markStageComplete,
    getStageElapsed,
  }), [
    state.stage,
    reducedMotion,
    showContent,
    showData,
    getStaggerDelay,
    getDurationMultiplier,
    isStageComplete,
    advanceStage,
    markStageComplete,
    getStageElapsed,
  ]);

  return (
    <AnimationOrchestratorContext.Provider value={value}>
      {children}
    </AnimationOrchestratorContext.Provider>
  );
};

/**
 * Hook to access animation orchestrator
 */
export const useAnimationOrchestrator = (): AnimationOrchestratorContextValue => {
  const context = useContext(AnimationOrchestratorContext);
  
  if (!context) {
    // Return a default context for components used outside the provider
    return {
      stage: 'ready',
      reducedMotion: false,
      showContent: true,
      showData: true,
      getStaggerDelay: (index) => index * STAGGER.normal,
      getDurationMultiplier: () => 1,
      isStageComplete: () => true,
      advanceStage: () => {},
      markStageComplete: () => {},
      getStageElapsed: () => 0,
    };
  }
  
  return context;
};

/**
 * Hook for page-level animation coordination
 */
export const usePageAnimations = () => {
  const orchestrator = useAnimationOrchestrator();
  
  return useMemo(() => ({
    ...orchestrator,
    
    // Convenience methods for common patterns
    getEntryProps: (index: number) => ({
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: orchestrator.reducedMotion ? 0 : TIMING.medium,
        delay: orchestrator.getStaggerDelay(index),
      },
    }),
    
    getCrossfadeProps: (isVisible: boolean) => ({
      initial: { opacity: 0 },
      animate: { opacity: isVisible ? 1 : 0 },
      transition: { duration: orchestrator.reducedMotion ? 0 : TIMING.fast },
    }),
  }), [orchestrator]);
};
