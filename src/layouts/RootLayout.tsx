import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MediaPlayerProvider } from '@/contexts/MediaPlayerContext';
import { MediaPlayer } from '@/components/MediaPlayer/MediaPlayer';
import { TopNavigationBar } from '@/components/navigation/TopNavigationBar';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useHomeAssistantConfig } from '@/hooks/useHomeAssistantConfig';
import { useHomeAssistantSync } from '@/hooks/useHomeAssistantSync';
import { EASING } from '@/constants/animations';

interface RootLayoutProps {
  children: ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  const { config, entityMapping, isConnected, saveConfig } = useHomeAssistantConfig();
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  return (
    <MediaPlayerProvider 
      entityId={entityMapping.mediaPlayer} 
      isConnected={isConnected}
    >
      <div className="h-screen w-full relative flex flex-col overflow-hidden">
        {/* Global Top Navigation Bar - Fixed at top (hidden on mobile) */}
        <TopNavigationBar
          currentPath={location.pathname}
          isConnected={isConnected}
          isReconnecting={isReconnecting}
          onSettingsClick={() => setSettingsOpen(true)}
          onReconnectClick={attemptReconnect}
        />

        {/* Settings Dialog */}
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          currentConfig={config}
          currentMapping={entityMapping}
          onSave={saveConfig}
        />

        {/* Page Content with AnimatePresence for smooth transitions */}
        <div className="flex-1 overflow-auto pt-0 md:pt-[68px] pb-[88px]">
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
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Media Player - Fixed at bottom */}
        <MediaPlayer />
      </div>
    </MediaPlayerProvider>
  );
};