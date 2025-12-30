import { motion } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";
import { useHAConnection } from "@/contexts/HAConnectionContext";

const SettingsConnectionBadge = () => {
  const { connectionStatus, haVersion } = useHAConnection();

  const stateConfig = {
    connected: {
      color: "text-warm-glow",
      bgColor: "bg-transparent",
      borderColor: "border-warm-glow/50",
      label: haVersion ? `v${haVersion}` : "Connected",
      showSpinner: false,
    },
    connecting: {
      color: "text-warm-glow",
      bgColor: "bg-warm-glow/10",
      borderColor: "border-warm-glow/30",
      label: "Connecting...",
      showSpinner: true,
    },
    disconnected: {
      color: "text-muted-foreground",
      bgColor: "bg-secondary/50",
      borderColor: "border-border/50",
      label: "Disconnected",
      showSpinner: false,
    },
    error: {
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
      label: "Error",
      showSpinner: false,
    },
  };

  const config = stateConfig[connectionStatus];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}
    >
      {config.showSpinner ? (
        <Loader2 className={`w-3.5 h-3.5 ${config.color} animate-spin`} />
      ) : (
        <motion.div
          animate={connectionStatus === "connected" ? { 
            opacity: [0.7, 1, 0.7],
          } : {}}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <Zap className={`w-3.5 h-3.5 ${config.color}`} />
        </motion.div>
      )}
      <span className={`text-xs font-light ${config.color}`}>
        {config.label}
      </span>
    </motion.div>
  );
};

export default SettingsConnectionBadge;
