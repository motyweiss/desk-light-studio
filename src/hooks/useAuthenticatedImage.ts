import { useState, useEffect, useRef, useCallback } from 'react';
import { homeAssistant } from '@/services/homeAssistant';

export const useAuthenticatedImage = (relativePath: string | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentPathRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetries = 3;

  const fetchImage = useCallback(async (path: string, signal?: AbortSignal): Promise<string | null> => {
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
    // Abort any previous fetch immediately
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Reset when path is null or empty
    if (!relativePath) {
      console.log('[useAuthenticatedImage] No path provided, clearing');
      setImageUrl(null);
      setIsLoading(false);
      setError(false);
      setIsTransitioning(false);
      currentPathRef.current = null;
      return;
    }

    // Check if HA config is available
    const haConfig = homeAssistant.getConfig();
    if (!haConfig) {
      console.warn('[useAuthenticatedImage] HA not configured, waiting...');
      return;
    }

    // Extract base path without query params for comparison
    const getBasePath = (path: string) => path.split('?')[0];
    const newBasePath = getBasePath(relativePath);
    const currentBasePath = currentPathRef.current ? getBasePath(currentPathRef.current) : null;
    
    // Check if the actual image path changed
    const pathChanged = newBasePath !== currentBasePath;
    
    // Skip if same path and we already have an image
    if (!pathChanged && imageUrl) {
      console.log('[useAuthenticatedImage] Same path, using cached image');
      return;
    }

    console.log('[useAuthenticatedImage] Path changed:', { 
      from: currentBasePath, 
      to: newBasePath, 
      pathChanged 
    });

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Mark as transitioning if we're changing from one image to another
    const isImageTransition = currentPathRef.current !== null && pathChanged;
    if (isImageTransition) {
      setIsTransitioning(true);
    }

    // Update current path ref immediately
    currentPathRef.current = relativePath;
    
    // Clear cache for fresh fetch on path change
    if (pathChanged) {
      homeAssistant.clearImageCache();
    }

    setIsLoading(true);
    setError(false);

    let retryCount = 0;

    const attemptFetch = async () => {
      if (abortController.signal.aborted) {
        return;
      }

      const dataUrl = await fetchImage(relativePath, abortController.signal);
      
      // Verify this is still the current request
      if (abortController.signal.aborted) {
        console.log('[useAuthenticatedImage] Request was aborted, ignoring result');
        return;
      }
      
      // Verify path hasn't changed during fetch
      if (relativePath !== currentPathRef.current) {
        console.log('[useAuthenticatedImage] Path changed during fetch, ignoring result');
        return;
      }
      
      if (dataUrl) {
        console.log('[useAuthenticatedImage] ✅ Setting new image URL');
        setImageUrl(dataUrl);
        setError(false);
        setIsLoading(false);
        setIsTransitioning(false);
      } else if (retryCount < maxRetries) {
        retryCount++;
        const delay = Math.min(Math.pow(2, retryCount) * 200, 2000);
        console.log(`[useAuthenticatedImage] Retry ${retryCount}/${maxRetries} in ${delay}ms`);
        
        setTimeout(() => {
          if (!abortController.signal.aborted && relativePath === currentPathRef.current) {
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
  }, [relativePath, fetchImage, imageUrl]);

  return { imageUrl, isLoading, error, isTransitioning };
};
