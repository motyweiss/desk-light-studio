import { useState, useEffect, useRef, useCallback } from 'react';
import { homeAssistant } from '@/services/homeAssistant';
import { useHAConnection } from '@/contexts/HAConnectionContext';

export const useAuthenticatedImage = (relativePath: string | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const lastPathRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const { config, isConnected } = useHAConnection();

  const fetchImage = useCallback(async (path: string) => {
    if (!config) {
      return null;
    }

    try {
      const dataUrl = await homeAssistant.fetchImageAsDataUrl(path);
      return dataUrl;
    } catch (err) {
      console.error('[useAuthenticatedImage] Fetch error:', err);
      return null;
    }
  }, [config]);

  useEffect(() => {
    // Reset when path is null
    if (!relativePath) {
      setImageUrl(null);
      setIsLoading(false);
      setError(false);
      lastPathRef.current = null;
      return;
    }

    // Don't fetch if not connected
    if (!isConnected || !config) {
      setIsLoading(false);
      return;
    }

    // Check if path actually changed (compare cache param too)
    const pathChanged = relativePath !== lastPathRef.current;
    
    if (!pathChanged) {
      return;
    }

    // Clear previous image immediately when track changes
    setImageUrl(null);
    lastPathRef.current = relativePath;
    setIsLoading(true);
    setError(false);
    retryCountRef.current = 0;

    // Clear the image cache for this path to force fresh fetch
    homeAssistant.clearImageCache();

    const attemptFetch = async () => {
      const dataUrl = await fetchImage(relativePath);
      
      // Verify we're still fetching the same path
      if (relativePath !== lastPathRef.current) {
        return;
      }
      
      if (dataUrl) {
        setImageUrl(dataUrl);
        setError(false);
        setIsLoading(false);
      } else if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 200;
        setTimeout(attemptFetch, delay);
      } else {
        setError(true);
        setIsLoading(false);
      }
    };

    attemptFetch();
  }, [relativePath, isConnected, config, fetchImage]);

  return { imageUrl, isLoading, error };
};
