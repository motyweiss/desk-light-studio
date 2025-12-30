import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MediaPlayerProvider, MediaPlayerUIProvider, useMediaPlayerUISafe } from '@/features/mediaPlayer';
import { MediaPlayer } from '@/components/MediaPlayer/MediaPlayer';
import { TopNavigationBar } from '@/components/navigation/TopNavigationBar';
import { DynamicLightingBackground } from '@/components/DynamicLightingBackground';
import { useHAConnection } from '@/contexts/HAConnectionContext';

interface RootLayoutProps {
  children: ReactNode;
}

// Context for sharing load state between Index and RootLayout
interface LoadStateContextValue {
  showMediaPlayer: boolean;
  showHeader: boolean;
  setShowMediaPlayer: (show: boolean) => void;
  setShowHeader: (show: boolean) => void;
}

const LoadStateContext = createContext<LoadStateContextValue>({
  showMediaPlayer: false,
  showHeader: false,
  setShowMediaPlayer: () => {},
  setShowHeader: () => {},
});

export const useLoadState = () => useContext(LoadStateContext);

// Page transition variants - simple and reliable
const pageVariants = {
  initial: { 
    opacity: 0,
    scale: 0.97,
    y: 16,
  },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: { 
    opacity: 0,
    scale: 0.99,
    y: -8,
  },
};

const pageTransition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1] as const,
};

// Media player variants - smoother timing
const mediaPlayerVariants = {
  initial: { 
    y: 80, 
    opacity: 0,
    scale: 0.98,
  },
  animate: { 
    y: 0, 
    opacity: 1,
    scale: 1,
  },
  exit: { 
    y: 60, 
    opacity: 0,
    scale: 0.98,
  },
};

// Header variants - no blur for reliability
const headerVariants = {
  initial: { 
    y: -20, 
    opacity: 0,
  },
  animate: { 
    y: 0, 
    opacity: 1,
  },
  exit: { 
    y: -10, 
    opacity: 0,
  },
};

// Inner component that uses the UI context
const RootLayoutContent = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  const { entityMapping, isConnected, isLoading: isConnecting, reconnect, connectionStatus } = useHAConnection();
  const isReconnecting = connectionStatus === 'connecting';
  const { isVisible } = useMediaPlayerUISafe();
  const { showMediaPlayer, showHeader, setShowMediaPlayer, setShowHeader } = useLoadState();

  const isSettingsPage = location.pathname === '/settings';
  const isMainPage = location.pathname === '/';

  // Immediately hide header and media player when navigating away from main page
  useEffect(() => {
    if (!isMainPage) {
      // Small delay for exit animation
      const timer = setTimeout(() => {
        setShowHeader(false);
        setShowMediaPlayer(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isMainPage, setShowHeader, setShowMediaPlayer]);

  // Bottom padding to ensure content doesn't get hidden behind the player
  const bottomPadding = isSettingsPage ? 0 : (showMediaPlayer ? 136 : 0);

  return (
    <div className="h-screen w-full relative flex flex-col overflow-hidden bg-background">
      {/* Dynamic lighting background - only on main page */}
      <AnimatePresence>
        {isMainPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DynamicLightingBackground />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        {/* Global Top Navigation Bar */}
        <AnimatePresence mode="wait">
          {isMainPage && showHeader && (
            <motion.div
              key="header"
              variants={headerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <TopNavigationBar
                currentPath={location.pathname}
                isConnected={isConnected}
                isConnecting={isConnecting}
                isReconnecting={isReconnecting}
                onReconnectClick={reconnect}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <div 
          className={`flex-1 overflow-auto ${isMainPage && showHeader ? 'pt-[56px] md:pt-[68px]' : 'pt-0'}`}
          style={{ paddingBottom: bottomPadding }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="w-full h-full"
              style={{ 
                transformOrigin: 'center top',
                willChange: 'opacity, transform',
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Media Player - entry from bottom */}
        <AnimatePresence mode="wait">
          {isMainPage && showMediaPlayer && (
            <motion.div
              key="media-player"
              variants={mediaPlayerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative z-20"
            >
              <MediaPlayer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { entityMapping, isConnected } = useHAConnection();
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  return (
    <LoadStateContext.Provider value={{ showMediaPlayer, showHeader, setShowMediaPlayer, setShowHeader }}>
      <MediaPlayerUIProvider>
        <MediaPlayerProvider 
          entityId={entityMapping?.mediaPlayer || ''} 
          isConnected={isConnected}
        >
          <RootLayoutContent>{children}</RootLayoutContent>
        </MediaPlayerProvider>
      </MediaPlayerUIProvider>
    </LoadStateContext.Provider>
  );
};
