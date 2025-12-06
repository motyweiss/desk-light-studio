import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { homeAssistant } from "@/services/homeAssistant";

interface SettingsConnectionBadgeProps {
  baseUrl: string;
  accessToken: string;
}

type ConnectionState = "connected" | "reconnecting" | "disconnected";

const SettingsConnectionBadge = ({ baseUrl, accessToken }: SettingsConnectionBadgeProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [haVersion, setHaVersion] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      if (!baseUrl || !accessToken) {
        setConnectionState("disconnected");
        setHaVersion(null);
        return;
      }

      setConnectionState("reconnecting");
      homeAssistant.setConfig({ baseUrl, accessToken });

      try {
        const result = await homeAssistant.testConnection();
        if (result.success && result.version) {
          setConnectionState("connected");
          setHaVersion(result.version);
        } else {
          setConnectionState("disconnected");
          setHaVersion(null);
        }
      } catch (error) {
        setConnectionState("disconnected");
        setHaVersion(null);
      }
    };

    testConnection();
  }, [baseUrl, accessToken]);

  const stateConfig = {
    connected: {
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/30",
      label: haVersion ? `v${haVersion}` : "Connected",
    },
    reconnecting: {
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      borderColor: "border-yellow-400/30",
      label: "Connecting...",
    },
    disconnected: {
      color: "text-white/40",
      bgColor: "bg-white/5",
      borderColor: "border-white/10",
      label: "Disconnected",
    },
  };

  const config = stateConfig[connectionState];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}
    >
      <motion.div
        animate={connectionState === "reconnecting" ? { 
          opacity: [0.5, 1, 0.5],
        } : {}}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        <Zap className={`w-3.5 h-3.5 ${config.color}`} />
      </motion.div>
      <span className={`text-xs font-light ${config.color}`}>
        {config.label}
      </span>
    </motion.div>
  );
};

export default SettingsConnectionBadge;
