import { useState, useEffect, useRef, useCallback } from 'react';
import { homeAssistant } from '@/services/homeAssistant';
import { useHAConnection } from '@/contexts/HAConnectionContext';

export const useAuthenticatedImage = (relativePath: string | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const lastPathRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetries = 3;

  const { config, isConnected } = useHAConnection();

  const fetchImage = useCallback(async (path: string, signal?: AbortSignal): Promise<string | null> => {
    if (!config) {
      return null;
    }

    try {
      const dataUrl = await homeAssistant.fetchImageAsDataUrl(path);
      
      // Check if aborted during fetch
      if (signal?.aborted) {
        return null;
      }
      
      return dataUrl;
    } catch (err) {
      if (signal?.aborted) {
        return null;
      }
      console.error('[useAuthenticatedImage] Fetch error:', err);
      return null;
    }
  }, [config]);

  useEffect(() => {
    // Abort any previous fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Reset when path is null
    if (!relativePath) {
      setImageUrl(null);
      setIsLoading(false);
      setError(false);
      lastPathRef.current = null;
      fetchingRef.current = false;
      return;
    }

    // Don't fetch if not connected
    if (!isConnected || !config) {
      setIsLoading(false);
      return;
    }

    // Extract base path without cache busting for comparison
    const getBasePath = (path: string) => path.split('?')[0];
    const currentBasePath = getBasePath(relativePath);
    const lastBasePath = lastPathRef.current ? getBasePath(lastPathRef.current) : null;
    
    // Check if the actual image path changed (not just cache param)
    const pathChanged = currentBasePath !== lastBasePath;
    
    if (!pathChanged && imageUrl) {
      return;
    }

    // Create new abort controller for this fetch
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Clear previous image and start loading
    lastPathRef.current = relativePath;
    setIsLoading(true);
    setError(false);
    retryCountRef.current = 0;
    fetchingRef.current = true;

    // Clear image cache for fresh fetch
    homeAssistant.clearImageCache();

    const attemptFetch = async () => {
      if (abortController.signal.aborted) {
        return;
      }

      const dataUrl = await fetchImage(relativePath, abortController.signal);
      
      // Verify still valid request
      if (abortController.signal.aborted || relativePath !== lastPathRef.current) {
        return;
      }
      
      if (dataUrl) {
        setImageUrl(dataUrl);
        setError(false);
        setIsLoading(false);
        fetchingRef.current = false;
      } else if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = Math.min(Math.pow(2, retryCountRef.current) * 150, 1500);
        
        setTimeout(() => {
          if (!abortController.signal.aborted) {
            attemptFetch();
          }
        }, delay);
      } else {
        setError(true);
        setIsLoading(false);
        fetchingRef.current = false;
      }
    };

    // Start fetch immediately
    attemptFetch();

    return () => {
      abortController.abort();
      fetchingRef.current = false;
    };
  }, [relativePath, isConnected, config, fetchImage, imageUrl]);

  return { imageUrl, isLoading, error };
};
