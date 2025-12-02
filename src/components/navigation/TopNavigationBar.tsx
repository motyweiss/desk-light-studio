import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Settings as SettingsIcon } from 'lucide-react';
import { ClimateIndicators } from '@/features/climate/components/ClimateIndicators';
import { ConnectionStatusIndicator } from '@/components/ConnectionStatusIndicator';

interface TopNavigationBarProps {
  currentPath: string;
  isConnected: boolean;
  isReconnecting: boolean;
  onReconnectClick: () => void;
}

export const TopNavigationBar = ({
  currentPath,
  isConnected,
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
      className="fixed top-0 inset-x-0 z-40 h-[68px] hidden md:block"
    >
      <div className="bg-white/8 backdrop-blur-[24px] border-b border-white/15 h-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          {/* Left: Home Branding */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Home className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            <span className="text-lg font-light text-white/90">Moty's Home</span>
          </motion.div>

          {/* Center: Climate Indicators */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ClimateIndicators />
          </motion.div>

          {/* Right: Connection Status + Settings */}
          <motion.div 
            className="flex items-center gap-4 overflow-visible"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ConnectionStatusIndicator
              isConnected={isConnected}
              isReconnecting={isReconnecting}
              onReconnectClick={onReconnectClick}
              inline={true}
            />
            
            <motion.button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:text-white transition-colors hover:bg-white/5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Settings"
            >
              <SettingsIcon className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
