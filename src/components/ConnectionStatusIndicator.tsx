import { motion } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  isConnecting?: boolean;
  onReconnectClick?: () => void;
  inline?: boolean;
}

export const ConnectionStatusIndicator = ({ 
  isConnected,
  isReconnecting = false,
  isConnecting = false,
  onReconnectClick,
  inline = false
}: ConnectionStatusIndicatorProps) => {

  const getStatusColor = () => {
    if (isConnecting || isReconnecting) return "text-yellow-400";
    if (!isConnected) return "text-foreground/30";
    return "text-yellow-400"; // Changed from white to yellow for connected state
  };

  const getTooltipText = () => {
    if (isConnecting) return "Connecting...";
    if (isReconnecting) return "Reconnecting...";
    if (!isConnected) return "Disconnected - Click to reconnect";
    return "Connected";
  };

  const handleClick = () => {
    // Only allow reconnect when disconnected
    if (!isConnected && !isReconnecting && !isConnecting && onReconnectClick) {
      onReconnectClick();
    }
  };

  // Only clickable when disconnected
  const isClickable = !isConnected && !isReconnecting && !isConnecting;
  const showSpinner = isConnecting || isReconnecting;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={handleClick}
          disabled={!isClickable}
          className={`hidden md:flex ${inline ? 'relative' : 'fixed top-6 right-6 z-50'} w-10 h-10 items-center justify-center rounded-lg hover:bg-white/5 transition-all duration-300 overflow-visible ${getStatusColor()} ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
          initial={inline ? false : { opacity: 0, scale: 0.8 }}
          animate={inline ? false : { opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={isClickable ? { scale: 0.95 } : { scale: 1.02 }}
          transition={inline ? undefined : { duration: 0.3, delay: 0.6 }}
          aria-label={getTooltipText()}
        >
          {showSpinner ? (
            <Loader2 className="w-5 h-5 animate-spin text-yellow-400" strokeWidth={1.5} />
          ) : (
            <Zap className="w-5 h-5" strokeWidth={1.5} />
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{getTooltipText()}</p>
      </TooltipContent>
    </Tooltip>
  );
};
