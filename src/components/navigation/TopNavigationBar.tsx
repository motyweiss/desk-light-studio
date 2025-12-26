import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import { ClimateIndicators } from '@/features/climate/components/ClimateIndicators';
import { ConnectionStatusIndicator } from '@/components/ConnectionStatusIndicator';
import { LogoutButton } from '@/components/LogoutButton';
import { HomeAssistantIcon } from '@/components/icons/HomeAssistantIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
            <HomeAssistantIcon className="w-5 h-5 md:w-6 md:h-6 text-white/90" />
            <span className="text-sm md:text-lg font-light text-white/90">Home Assistant</span>
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
            <div className="hidden md:flex items-center gap-1">
              <ConnectionStatusIndicator
                isConnected={isConnected}
                isConnecting={isConnecting}
                isReconnecting={isReconnecting}
                onReconnectClick={onReconnectClick}
                inline={true}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={onReconnectClick}
                    disabled={isConnecting || isReconnecting}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Refresh connection"
                  >
                    <RefreshCw 
                      className={`w-4 h-4 ${isConnecting || isReconnecting ? 'animate-spin' : ''}`} 
                      strokeWidth={1.5} 
                    />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>רענון חיבור</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => navigate('/settings')}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white hover:text-white transition-colors hover:bg-white/5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Settings"
                >
                  <SettingsIcon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>

            <div className="hidden md:block">
              <LogoutButton />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
