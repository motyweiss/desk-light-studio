import { useState, useEffect, useRef, useCallback } from 'react';
import { homeAssistant } from '@/services/homeAssistant';
import { useHAConnection } from '@/contexts/HAConnectionContext';

export const useAuthenticatedImage = (relativePath: string | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const lastPathRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetries = 3;

  const { config, isConnected } = useHAConnection();

  const fetchImage = useCallback(async (path: string, signal?: AbortSignal): Promise<string | null> => {
    if (!config) {
      console.log('[useAuthenticatedImage] No config available');
      return null;
    }

    try {
      console.log('[useAuthenticatedImage] Fetching image:', path);
      const dataUrl = await homeAssistant.fetchImageAsDataUrl(path);
      
      // Check if aborted during fetch
      if (signal?.aborted) {
        console.log('[useAuthenticatedImage] Fetch aborted');
        return null;
      }
      
      if (dataUrl) {
        console.log('[useAuthenticatedImage] Image loaded successfully');
      } else {
        console.log('[useAuthenticatedImage] No data URL returned');
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
      setIsTransitioning(false);
      lastPathRef.current = null;
      return;
    }

    // Don't fetch if not connected
    if (!isConnected || !config) {
      console.log('[useAuthenticatedImage] Not connected, skipping fetch');
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
      console.log('[useAuthenticatedImage] Same path, using cached image');
      return;
    }

    // Create new abort controller for this fetch
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Track if this is a transition (changing images vs initial load)
    const isInitialLoad = !lastPathRef.current;
    
    // Mark as transitioning for track changes (keep old image visible)
    if (!isInitialLoad && pathChanged) {
      setIsTransitioning(true);
    }

    // Clear previous path and start loading
    lastPathRef.current = relativePath;
    setIsLoading(true);
    setError(false);
    retryCountRef.current = 0;

    // Clear image cache for fresh fetch
    homeAssistant.clearImageCache();

    console.log('[useAuthenticatedImage] Starting fetch for:', relativePath);

    const attemptFetch = async () => {
      if (abortController.signal.aborted) {
        return;
      }

      const dataUrl = await fetchImage(relativePath, abortController.signal);
      
      // Verify still valid request
      if (abortController.signal.aborted || relativePath !== lastPathRef.current) {
        console.log('[useAuthenticatedImage] Request outdated, ignoring result');
        return;
      }
      
      if (dataUrl) {
        setImageUrl(dataUrl);
        setError(false);
        setIsLoading(false);
        setIsTransitioning(false);
      } else if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = Math.min(Math.pow(2, retryCountRef.current) * 200, 2000);
        console.log(`[useAuthenticatedImage] Retry ${retryCountRef.current}/${maxRetries} in ${delay}ms`);
        
        setTimeout(() => {
          if (!abortController.signal.aborted) {
            attemptFetch();
          }
        }, delay);
      } else {
        console.warn('[useAuthenticatedImage] All retries failed');
        setError(true);
        setIsLoading(false);
        setIsTransitioning(false);
        // Clear stale image on error
        setImageUrl(null);
      }
    };

    // Start fetch immediately
    attemptFetch();

    return () => {
      abortController.abort();
    };
  }, [relativePath, isConnected, config, fetchImage, imageUrl]);

  return { imageUrl, isLoading, error, isTransitioning };
};
