import { useState, useEffect, useRef } from 'react';
import { homeAssistant } from '@/services/homeAssistant';

export const useAuthenticatedImage = (relativePath: string | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!relativePath) {
      setImageUrl(null);
      setIsLoading(false);
      setError(false);
      return;
    }

    // Skip if same path
    if (relativePath === lastPathRef.current && imageUrl) {
      return;
    }

    lastPathRef.current = relativePath;
    setIsLoading(true);
    setError(false);

    homeAssistant.fetchImageAsDataUrl(relativePath)
      .then((dataUrl) => {
        if (dataUrl) {
          setImageUrl(dataUrl);
          setError(false);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [relativePath]);

  return { imageUrl, isLoading, error };
};
