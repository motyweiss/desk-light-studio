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
    // Ensure config is set before attempting fetch
    if (!config) {
      console.log('[useAuthenticatedImage] Config not available yet, waiting...');
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

    // Skip if same path and we already have the image
    if (relativePath === lastPathRef.current && imageUrl) {
      return;
    }

    lastPathRef.current = relativePath;
    setIsLoading(true);
    setError(false);
    retryCountRef.current = 0;

    const attemptFetch = async () => {
      const dataUrl = await fetchImage(relativePath);
      
      if (dataUrl) {
        setImageUrl(dataUrl);
        setError(false);
        setIsLoading(false);
      } else if (retryCountRef.current < maxRetries) {
        // Retry with exponential backoff
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 200;
        console.log(`[useAuthenticatedImage] Retry ${retryCountRef.current}/${maxRetries} in ${delay}ms`);
        setTimeout(attemptFetch, delay);
      } else {
        setError(true);
        setIsLoading(false);
      }
    };

    attemptFetch();
  }, [relativePath, isConnected, config, fetchImage, imageUrl]);

  // Re-fetch when connection becomes available
  useEffect(() => {
    if (isConnected && config && relativePath && !imageUrl && !isLoading) {
      lastPathRef.current = null; // Reset to trigger refetch
    }
  }, [isConnected, config, relativePath, imageUrl, isLoading]);

  return { imageUrl, isLoading, error };
};
