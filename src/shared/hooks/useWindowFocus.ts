import { useEffect, useState } from 'react';

/**
 * Track window focus and visibility state
 * Returns true when window is focused and visible
 */
export const useWindowFocus = (): boolean => {
  const [isFocused, setIsFocused] = useState(() => {
    return typeof document !== 'undefined' && document.hasFocus();
  });

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const handleVisibilityChange = () => {
      setIsFocused(!document.hidden && document.hasFocus());
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isFocused;
};
