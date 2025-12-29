import { useEffect, useState } from 'react';

/**
 * Hook to detect user's reduced motion preference
 * 
 * Uses the prefers-reduced-motion media query to respect accessibility settings.
 * When reduced motion is preferred, animations should be minimized or disabled.
 */
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return reducedMotion;
};
