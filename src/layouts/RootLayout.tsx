import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MediaPlayerProvider } from '@/contexts/MediaPlayerContext';
import { MediaPlayer } from '@/components/MediaPlayer/MediaPlayer';
import { TopNavigationBar } from '@/components/navigation/TopNavigationBar';
import { useHomeAssistantConfig } from '@/hooks/useHomeAssistantConfig';
import { useHomeAssistantSync } from '@/hooks/useHomeAssistantSync';
import { EASING } from '@/constants/animations';

interface RootLayoutProps {
  children: ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  const { entityMapping, isConnected } = useHomeAssistantConfig();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [pendingLights] = useState<Set<string>>(new Set());

  const { attemptReconnect } = useHomeAssistantSync({
    isConnected,
    entityMapping,
    pendingLights,
    onLightsUpdate: () => {},
    onSensorsUpdate: () => {},
    onReconnectingChange: setIsReconnecting,
  });

  const isSettingsPage = location.pathname === '/settings';

  return (
    <MediaPlayerProvider 
      entityId={entityMapping.mediaPlayer} 
      isConnected={isConnected}
    >
      <div 
        className="h-screen w-full relative flex flex-col overflow-hidden"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "hsl(0 0% 8%)",
        }}
      >
        {/* Global Top Navigation Bar - Fixed at top (hidden on mobile and settings page) */}
        {!isSettingsPage && (
          <TopNavigationBar
            currentPath={location.pathname}
            isConnected={isConnected}
            isReconnecting={isReconnecting}
            onReconnectClick={attemptReconnect}
          />
        )}

        {/* Page Content with AnimatePresence for smooth transitions */}
        <div className={`flex-1 overflow-auto pt-0 ${!isSettingsPage ? 'md:pt-[68px]' : ''} ${isSettingsPage ? 'pb-0' : 'pb-[96px]'}`}>
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
    </MediaPlayerProvider>
  );
};