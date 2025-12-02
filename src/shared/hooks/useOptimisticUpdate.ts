import { useState, useCallback, useRef, useEffect } from 'react';
import { useDebouncedCallback } from './useDebounce';

interface UseOptimisticUpdateOptions<T> {
  debounce?: number;
  onError?: (error: Error, previousValue: T) => void;
}

interface UseOptimisticUpdateReturn<T> {
  value: T;
  displayValue: T;
  setValue: (value: T) => void;
  isPending: boolean;
  hasError: boolean;
  retry: () => Promise<void>;
  forceSync: (value: T) => void;
}

/**
 * Optimistic update hook with rollback on error
 * Provides immediate UI feedback while syncing with backend
 */
export const useOptimisticUpdate = <T>(
  initialValue: T,
  onCommit: (value: T) => Promise<boolean>,
  options: UseOptimisticUpdateOptions<T> = {}
): UseOptimisticUpdateReturn<T> => {
  const { debounce = 0, onError } = options;

  const [displayValue, setDisplayValue] = useState<T>(initialValue);
  const [confirmedValue, setConfirmedValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);

  const pendingValueRef = useRef<T | null>(null);
  const isCommittingRef = useRef(false);

  // Commit function that sends to backend
  const commit = useCallback(
    async (value: T) => {
      if (isCommittingRef.current) return;

      isCommittingRef.current = true;
      pendingValueRef.current = value;
      setIsPending(true);
      setHasError(false);

      try {
        const success = await onCommit(value);
        
        if (success) {
          setConfirmedValue(value);
          setHasError(false);
        } else {
          // Rollback on failure
          setDisplayValue(confirmedValue);
          setHasError(true);
          onError?.(new Error('Commit failed'), confirmedValue);
        }
      } catch (error) {
        // Rollback on error
        setDisplayValue(confirmedValue);
        setHasError(true);
        onError?.(error as Error, confirmedValue);
      } finally {
        isCommittingRef.current = false;
        pendingValueRef.current = null;
        setIsPending(false);
      }
    },
    [onCommit, confirmedValue, onError]
  );

  const debouncedCommit = useDebouncedCallback(commit, debounce);

  // Set value with optimistic update
  const setValue = useCallback(
    (value: T) => {
      setDisplayValue(value);
      setHasError(false);

      if (debounce > 0) {
        debouncedCommit(value);
      } else {
        commit(value);
      }
    },
    [commit, debouncedCommit, debounce]
  );

  // Retry last failed commit
  const retry = useCallback(async () => {
    if (hasError && displayValue !== confirmedValue) {
      await commit(displayValue);
    }
  }, [hasError, displayValue, confirmedValue, commit]);

  // Force sync from remote (e.g., after polling)
  const forceSync = useCallback((value: T) => {
    // Only update if we're not currently pending
    if (!isCommittingRef.current) {
      setDisplayValue(value);
      setConfirmedValue(value);
    }
  }, []);

  // Update display value when initial value changes
  useEffect(() => {
    if (!isPending && !hasError) {
      setDisplayValue(initialValue);
      setConfirmedValue(initialValue);
    }
  }, [initialValue, isPending, hasError]);

  return {
    value: confirmedValue,
    displayValue,
    setValue,
    isPending,
    hasError,
    retry,
    forceSync,
  };
};
