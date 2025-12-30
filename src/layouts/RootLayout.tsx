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

// Inner component that uses the UI context
const RootLayoutContent = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  const { entityMapping, isConnected, isLoading: isConnecting, reconnect, connectionStatus } = useHAConnection();
  const isReconnecting = connectionStatus === 'connecting';
  const { isVisible } = useMediaPlayerUISafe();
  const { showMediaPlayer, showHeader, setShowMediaPlayer, setShowHeader } = useLoadState();

  const isSettingsPage = location.pathname === '/settings';
  const isMainPage = location.pathname === '/';

  // Hide header and media player when navigating away from main page
  useEffect(() => {
    if (!isMainPage) {
      setShowHeader(false);
      setShowMediaPlayer(false);
    }
  }, [isMainPage, setShowHeader, setShowMediaPlayer]);

  // Bottom padding to ensure content doesn't get hidden behind the player
  const bottomPadding = isMainPage && showMediaPlayer ? 136 : 0;

  return (
    <div className="h-screen w-full relative flex flex-col overflow-hidden bg-background">
      {/* Dynamic lighting background - only on main page */}
      {isMainPage && <DynamicLightingBackground />}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        {/* Global Top Navigation Bar */}
        {isMainPage && showHeader && (
          <TopNavigationBar
            currentPath={location.pathname}
            isConnected={isConnected}
            isConnecting={isConnecting}
            isReconnecting={isReconnecting}
            onReconnectClick={reconnect}
          />
        )}

        {/* Page Content - Simple fade transition */}
        <div 
          className={`flex-1 overflow-auto ${isMainPage && showHeader ? 'pt-[56px] md:pt-[68px]' : 'pt-0'}`}
          style={{ paddingBottom: bottomPadding }}
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </div>

        {/* Global Media Player */}
        {isMainPage && showMediaPlayer && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20"
          >
            <MediaPlayer />
          </motion.div>
        )}
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
