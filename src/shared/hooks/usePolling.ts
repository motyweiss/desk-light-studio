import { useEffect, useRef, useCallback } from 'react';
import { useWindowFocus } from './useWindowFocus';

interface UsePollingOptions<T> {
  interval: number;
  enabled: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  runOnFocus?: boolean;
}

/**
 * Generic polling hook with window focus detection
 * Automatically syncs when window regains focus
 */
export const usePolling = <T>(
  fetcher: () => Promise<T>,
  options: UsePollingOptions<T>
) => {
  const { interval, enabled, onSuccess, onError, runOnFocus = true } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFocused = useWindowFocus();
  const lastFocusedRef = useRef(isFocused);

  const poll = useCallback(async () => {
    if (!enabled) return;

    try {
      const data = await fetcher();
      onSuccess?.(data);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [fetcher, enabled, onSuccess, onError]);

  // Handle window focus changes
  useEffect(() => {
    if (runOnFocus && isFocused && !lastFocusedRef.current && enabled) {
      poll();
    }
    lastFocusedRef.current = isFocused;
  }, [isFocused, runOnFocus, enabled, poll]);

  // Setup polling interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial poll
    poll();

    // Setup interval
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, poll]);

  return { poll };
};
