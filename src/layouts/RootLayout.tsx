import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MediaPlayerProvider } from '@/contexts/MediaPlayerContext';
import { MediaPlayer } from '@/components/MediaPlayer/MediaPlayer';
import { useHomeAssistantConfig } from '@/hooks/useHomeAssistantConfig';
import { EASING, DURATION } from '@/constants/animations';

interface RootLayoutProps {
  children: ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  const { entityMapping, isConnected } = useHomeAssistantConfig();

  return (
    <MediaPlayerProvider 
      entityId={entityMapping.mediaPlayer} 
      isConnected={isConnected}
    >
      <div className="min-h-screen w-full relative">
        {/* Page Content with AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.5,
              ease: EASING.smooth,
            }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {/* Global Media Player - Fixed at bottom */}
        <MediaPlayer />
      </div>
    </MediaPlayerProvider>
  );
};