import React, { ReactNode, createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MediaPlayerProvider, MediaPlayerUIProvider, useMediaPlayerUISafe } from '@/features/mediaPlayer';
import { MediaPlayer } from '@/components/MediaPlayer/MediaPlayer';
import { TopNavigationBar } from '@/components/navigation/TopNavigationBar';
import { DynamicLightingBackground } from '@/components/DynamicLightingBackground';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { PAGE_TRANSITIONS } from '@/lib/animations/tokens';
import { LOAD_SEQUENCE } from '@/constants/loadingSequence';

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

// Inner component that uses the UI context
const RootLayoutContent = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  const { entityMapping, isConnected, isLoading: isConnecting, reconnect, connectionStatus } = useHAConnection();
  const isReconnecting = connectionStatus === 'connecting';
  const { isVisible } = useMediaPlayerUISafe();
  const { showMediaPlayer, showHeader } = useLoadState();

  const isSettingsPage = location.pathname === '/settings';

  // Bottom padding to ensure content doesn't get hidden behind the player
  const bottomPadding = isSettingsPage ? 0 : 136;

  return (
    <div 
      className="h-screen w-full relative flex flex-col overflow-hidden bg-background"
    >
      {/* Dynamic lighting background - only on main page */}
      {!isSettingsPage && <DynamicLightingBackground />}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        {/* Global Top Navigation Bar */}
        <AnimatePresence>
          {!isSettingsPage && showHeader && (
            <TopNavigationBar
              currentPath={location.pathname}
              isConnected={isConnected}
              isConnecting={isConnecting}
              isReconnecting={isReconnecting}
              onReconnectClick={reconnect}
            />
          )}
        </AnimatePresence>

        {/* Page Content */}
        <div 
          className={`flex-1 overflow-auto ${!isSettingsPage ? 'pt-[56px] md:pt-[68px]' : 'pt-0'}`}
          style={{ paddingBottom: bottomPadding }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Media Player - entry from bottom */}
        <AnimatePresence>
          {!isSettingsPage && showMediaPlayer && (
            <motion.div
              initial={{ 
                y: LOAD_SEQUENCE.mediaPlayer.yFrom, 
                opacity: 0 
              }}
              animate={{ 
                y: 0, 
                opacity: 1 
              }}
              exit={{ 
                y: LOAD_SEQUENCE.mediaPlayer.yFrom, 
                opacity: 0 
              }}
              transition={{
                y: {
                  duration: LOAD_SEQUENCE.mediaPlayer.duration,
                  delay: LOAD_SEQUENCE.mediaPlayer.delay,
                  ease: LOAD_SEQUENCE.mediaPlayer.ease,
                },
                opacity: {
                  duration: LOAD_SEQUENCE.mediaPlayer.opacity.duration,
                  delay: LOAD_SEQUENCE.mediaPlayer.opacity.delay,
                  ease: LOAD_SEQUENCE.mediaPlayer.ease,
                },
              }}
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
