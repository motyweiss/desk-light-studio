import { motion } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";
import { useHAConnection } from "@/contexts/HAConnectionContext";

const SettingsConnectionBadge = () => {
  const { connectionStatus, haVersion } = useHAConnection();

  const stateConfig = {
    connected: {
      color: "text-warm-glow",
      bgColor: "bg-warm-glow/10",
      borderColor: "border-warm-glow/30",
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
      color: "text-white/50",
      bgColor: "bg-white/[0.04]",
      borderColor: "border-white/[0.08]",
      label: "Disconnected",
      showSpinner: false,
    },
    error: {
      color: "text-status-critical",
      bgColor: "bg-status-critical/10",
      borderColor: "border-status-critical/30",
      label: "Error",
      showSpinner: false,
    },
  };

  const config = stateConfig[connectionStatus];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-xl transition-all duration-500 ${config.bgColor} ${config.borderColor}`}
    >
      {config.showSpinner ? (
        <Loader2 className={`w-3.5 h-3.5 ${config.color} animate-spin`} />
      ) : connectionStatus !== "connected" ? (
        <Zap className={`w-3.5 h-3.5 ${config.color}`} />
      ) : null}
      <span className={`text-xs font-light ${config.color}`}>
        {config.label}
      </span>
    </motion.div>
  );
};

export default SettingsConnectionBadge;
