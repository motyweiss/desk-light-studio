import { ReactNode, useState, useEffect } from 'react';
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
  const [bgReady, setBgReady] = useState(false);

  // Preload background image for smooth fade-in
  useEffect(() => {
    const bgImg = new Image();
    bgImg.src = '/bg.png';
    bgImg.onload = () => setBgReady(true);
  }, []);

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
      <div className="h-screen w-full relative flex flex-col overflow-hidden">
        {/* Solid background color - always visible */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: "#96856e" }}
        />
        
        {/* Background image with fade-in */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: bgReady ? 1 : 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.1, 0.25, 1] 
          }}
          style={{
            backgroundImage: "url('/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col overflow-hidden">
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
      </div>
    </MediaPlayerProvider>
  );
};