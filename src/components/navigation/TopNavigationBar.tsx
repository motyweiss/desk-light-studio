import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Settings as SettingsIcon } from 'lucide-react';
import { ClimateIndicators } from '@/features/climate/components/ClimateIndicators';
import { ConnectionStatusIndicator } from '@/components/ConnectionStatusIndicator';
import { LogoutButton } from '@/components/LogoutButton';

interface TopNavigationBarProps {
  currentPath: string;
  isConnected: boolean;
  isConnecting?: boolean;
  isReconnecting: boolean;
  onReconnectClick: () => void;
}

export const TopNavigationBar = ({
  currentPath,
  isConnected,
  isConnecting = false,
  isReconnecting,
  onReconnectClick,
}: TopNavigationBarProps) => {
  const navigate = useNavigate();
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        delay: 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fixed top-0 inset-x-0 z-40 h-[56px] md:h-[68px]"
    >
      <div className="bg-white/8 backdrop-blur-[24px] border-b border-white/15 h-full">
        <div className="max-w-7xl mx-auto px-3 md:px-6 h-full flex items-center justify-between">
          {/* Left: Home Branding */}
          <motion.div 
            className="flex items-center gap-2 md:gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Home className="w-4 h-4 md:w-5 md:h-5 text-white/70" strokeWidth={1.5} />
            <span className="text-sm md:text-lg font-light text-white/90">My Home</span>
          </motion.div>

          {/* Center: Climate Indicators - Hidden on mobile */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ClimateIndicators />
          </motion.div>

          {/* Right: Connection Status + Settings + Logout */}
          <motion.div 
            className="flex items-center gap-1 md:gap-2 overflow-visible"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="hidden md:block">
              <ConnectionStatusIndicator
                isConnected={isConnected}
                isConnecting={isConnecting}
                isReconnecting={isReconnecting}
                onReconnectClick={onReconnectClick}
                inline={true}
              />
            </div>
            
            <motion.button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white hover:text-white transition-colors hover:bg-white/5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Settings"
            >
              <SettingsIcon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
            </motion.button>

            <div className="hidden md:block">
              <LogoutButton />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
