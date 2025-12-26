import { useState, useEffect, useRef, useCallback } from 'react';
import { homeAssistant } from '@/services/homeAssistant';

export const useAuthenticatedImage = (relativePath: string | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const lastPathRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetries = 3;

  const fetchImage = useCallback(async (path: string, signal?: AbortSignal): Promise<string | null> => {
    // Check if HA service has config set
    const haConfig = homeAssistant.getConfig();
    if (!haConfig) {
      console.warn('[useAuthenticatedImage] No HA config available');
      return null;
    }

    try {
      console.log('[useAuthenticatedImage] Fetching image:', path);
      const dataUrl = await homeAssistant.fetchImageAsDataUrl(path);
      
      if (signal?.aborted) {
        console.log('[useAuthenticatedImage] Fetch aborted');
        return null;
      }
      
      if (dataUrl) {
        console.log('[useAuthenticatedImage] ✅ Image loaded, length:', dataUrl.length);
      } else {
        console.warn('[useAuthenticatedImage] ❌ No data URL returned');
      }
      
      return dataUrl;
    } catch (err) {
      if (signal?.aborted) {
        return null;
      }
      console.error('[useAuthenticatedImage] Fetch error:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    // Abort any previous fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Reset when path is null or empty
    if (!relativePath) {
      console.log('[useAuthenticatedImage] No path provided');
      setImageUrl(null);
      setIsLoading(false);
      setError(false);
      setIsTransitioning(false);
      lastPathRef.current = null;
      return;
    }

    // Check if HA config is available
    const haConfig = homeAssistant.getConfig();
    if (!haConfig) {
      console.warn('[useAuthenticatedImage] HA not configured, waiting...');
      // Don't set loading to false - wait for config
      return;
    }

    console.log('[useAuthenticatedImage] Effect running for:', relativePath);

    // Extract base path without cache busting for comparison
    const getBasePath = (path: string) => path.split('?')[0];
    const currentBasePath = getBasePath(relativePath);
    const lastBasePath = lastPathRef.current ? getBasePath(lastPathRef.current) : null;
    
    // Check if the actual image path changed
    const pathChanged = currentBasePath !== lastBasePath;
    
    if (!pathChanged && imageUrl) {
      console.log('[useAuthenticatedImage] Same path, using cached');
      return;
    }

    // Create new abort controller for this fetch
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Track if this is a transition (changing images vs initial load)
    const isInitialLoad = !lastPathRef.current;
    
    // Mark as transitioning for track changes
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

    console.log('[useAuthenticatedImage] 🚀 Starting fetch for:', relativePath);

    const attemptFetch = async () => {
      if (abortController.signal.aborted) {
        return;
      }

      const dataUrl = await fetchImage(relativePath, abortController.signal);
      
      // Verify still valid request
      if (abortController.signal.aborted || relativePath !== lastPathRef.current) {
        console.log('[useAuthenticatedImage] Request outdated');
        return;
      }
      
      if (dataUrl) {
        console.log('[useAuthenticatedImage] ✅ Setting image URL');
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
        console.warn('[useAuthenticatedImage] ❌ All retries failed');
        setError(true);
        setIsLoading(false);
        setIsTransitioning(false);
      }
    };

    // Start fetch immediately
    attemptFetch();

    return () => {
      abortController.abort();
    };
  }, [relativePath, fetchImage]);

  return { imageUrl, isLoading, error, isTransitioning };
};
