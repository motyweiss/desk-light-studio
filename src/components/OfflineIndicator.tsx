import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

/**
 * Show offline indicator when network is unavailable
 */
export const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-white/80" />
              <div className="text-white/90 text-sm font-light">
                You're offline - Using cached data
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
