import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  isSyncing?: boolean;
  onClick?: () => void;
}

export const ConnectionStatusIndicator = ({ 
  isConnected, 
  onClick 
}: ConnectionStatusIndicatorProps) => {
  const getStatusColor = () => {
    if (!isConnected) return "text-foreground/30";
    return "text-[hsl(43,88%,63%)]"; // Active yellow color
  };

  const getTooltipText = () => {
    if (!isConnected) return "Not connected to Home Assistant";
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
            <Zap className="w-5 h-5" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-background/95 backdrop-blur-xl border-white/20">
          <p className="text-sm font-light">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
