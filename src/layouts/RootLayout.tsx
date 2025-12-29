import React, { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MediaPlayerProvider, MediaPlayerUIProvider, useMediaPlayerUISafe, PLAYER_HEIGHTS } from '@/features/mediaPlayer';
import { MediaPlayer } from '@/components/MediaPlayer/MediaPlayer';
import { TopNavigationBar } from '@/components/navigation/TopNavigationBar';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { PAGE_TRANSITIONS, EASE } from '@/lib/animations/tokens';

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
      className="h-screen w-full relative flex flex-col overflow-hidden bg-background"
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