import React, { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MediaPlayerProvider, MediaPlayerUIProvider, useMediaPlayerUISafe, PLAYER_HEIGHTS } from '@/features/mediaPlayer';
import { MediaPlayer } from '@/components/MediaPlayer/MediaPlayer';
import { TopNavigationBar } from '@/components/navigation/TopNavigationBar';
import { useHAConnection } from '@/contexts/HAConnectionContext';

interface RootLayoutProps {
  children: ReactNode;
}

// Inner component that uses the UI context
const RootLayoutContent = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  const { entityMapping, isConnected, isLoading: isConnecting, reconnect, connectionStatus } = useHAConnection();
  const isReconnecting = connectionStatus === 'connecting';
  const { isVisible } = useMediaPlayerUISafe();

  const isSettingsPage = location.pathname === '/settings';

  // Bottom padding to ensure content doesn't get hidden behind the player
  // Player height (64px minimized) + bottom offset (16px) + comfortable buffer (16px)
  const bottomPadding = isSettingsPage ? 0 : 96;

  return (
    <div 
      className="h-screen w-full relative flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#90785D",
      }}
    >
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        {/* Global Top Navigation Bar - Fixed at top (hidden on mobile and settings page) */}
        {!isSettingsPage && (
          <TopNavigationBar
            currentPath={location.pathname}
            isConnected={isConnected}
            isConnecting={isConnecting}
            isReconnecting={isReconnecting}
            onReconnectClick={reconnect}
          />
        )}

        {/* Page Content with AnimatePresence for smooth transitions */}
        <div 
          className={`flex-1 overflow-auto ${!isSettingsPage ? 'pt-[56px] md:pt-[68px]' : 'pt-0'}`}
          style={{ paddingBottom: bottomPadding }}
        >
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Media Player - Fixed at bottom (hidden on settings page) */}
        {!isSettingsPage && <MediaPlayer />}
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