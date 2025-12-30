import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MediaPlayerProvider, MediaPlayerUIProvider, useMediaPlayerUISafe } from '@/features/mediaPlayer';
import { MediaPlayer } from '@/components/MediaPlayer/MediaPlayer';
import { TopNavigationBar } from '@/components/navigation/TopNavigationBar';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { PAGE_TRANSITIONS } from '@/lib/animations/tokens';
import { LOAD_SEQUENCE } from '@/constants/loadingSequence';
import { usePageLoadSequence } from '@/hooks/usePageLoadSequence';
import { useClimate } from '@/features/climate';

interface RootLayoutProps {
  children: ReactNode;
}

// Inner component that uses the UI context
const RootLayoutContent = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  const { entityMapping, isConnected, isLoading: isConnecting, reconnect, connectionStatus } = useHAConnection();
  const isReconnecting = connectionStatus === 'connecting';
  const { isVisible } = useMediaPlayerUISafe();
  const climate = useClimate();

  const isSettingsPage = location.pathname === '/settings';

  // Use page load sequence for media player visibility
  const { showMediaPlayer, showHeader, showContent } = usePageLoadSequence({
    overlayComplete: true, // RootLayout assumes overlay is managed by Index
    isConnected,
    isDataLoaded: climate.isLoaded,
  });

  // Bottom padding to ensure content doesn't get hidden behind the player
  // Player height (64px minimized) + bottom offset (16px) + comfortable buffer (56px)
  const bottomPadding = isSettingsPage ? 0 : 136;

  return (
    <div 
      className="h-screen w-full relative flex flex-col overflow-hidden bg-background"
    >
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        {/* Global Top Navigation Bar - Fixed at top (hidden on mobile and settings page) */}
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

        {/* Page Content with AnimatePresence for smooth transitions */}
        <div 
          className={`flex-1 overflow-auto ${!isSettingsPage ? 'pt-[56px] md:pt-[68px]' : 'pt-0'}`}
          style={{ paddingBottom: bottomPadding }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: PAGE_TRANSITIONS.scale.enter }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: PAGE_TRANSITIONS.scale.exit }}
              transition={{
                duration: PAGE_TRANSITIONS.duration,
                ease: PAGE_TRANSITIONS.ease,
              }}
              className="w-full h-full"
              style={{ 
                transformOrigin: 'center center',
                willChange: 'opacity, transform',
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Media Player - Fixed at bottom with entry animation (hidden on settings page) */}
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

  return (
    <MediaPlayerUIProvider>
      <MediaPlayerProvider 
        entityId={entityMapping?.mediaPlayer || ''} 
        isConnected={isConnected}
      >
        <RootLayoutContent>{children}</RootLayoutContent>
      </MediaPlayerProvider>
    </MediaPlayerUIProvider>
  );
};
