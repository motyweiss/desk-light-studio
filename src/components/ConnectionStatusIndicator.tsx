import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  isSyncing?: boolean;
  onClick?: () => void;
}

export const ConnectionStatusIndicator = ({ 
  isConnected, 
  isSyncing = false,
  onClick 
}: ConnectionStatusIndicatorProps) => {
  const getStatusColor = () => {
    if (!isConnected) return "text-foreground/30";
    return "text-[hsl(43,88%,63%)]"; // Active yellow color
  };

  const getTooltipText = () => {
    if (!isConnected) return "Not connected to Home Assistant";
    if (isSyncing) return "Syncing with Home Assistant...";
    return "Connected to Home Assistant";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={onClick}
            className={`fixed top-6 right-20 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center ${getStatusColor()} hover:bg-white/15 hover:border-white/30 transition-all duration-300`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            {!isConnected ? (
              <WifiOff className="w-5 h-5" />
            ) : isSyncing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Wifi className="w-5 h-5" />
              </motion.div>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-background/95 backdrop-blur-xl border-white/20">
          <p className="text-sm font-light">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
