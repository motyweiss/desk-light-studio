import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Zap, Globe, Server } from "lucide-react";
import { homeAssistant } from "@/services/homeAssistant";

interface QuickConnectSuggestionsProps {
  onUrlSelect: (url: string) => void;
  currentUrl: string;
  accessToken: string;
}

const COMMON_HA_URLS = [
  { url: "http://homeassistant.local:8123", label: "homeassistant.local", icon: Globe },
  { url: "http://homeassistant:8123", label: "homeassistant", icon: Server },
  { url: "http://192.168.1.1:8123", label: "192.168.1.1", icon: Server },
  { url: "http://192.168.0.1:8123", label: "192.168.0.1", icon: Server },
];

export const QuickConnectSuggestions = ({ 
  onUrlSelect, 
  currentUrl,
  accessToken 
}: QuickConnectSuggestionsProps) => {
  const [testingUrl, setTestingUrl] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, 'success' | 'failed' | null>>({});

  const testUrl = async (url: string) => {
    if (!accessToken) {
      return;
    }

    setTestingUrl(url);
    setResults(prev => ({ ...prev, [url]: null }));

    try {
      const normalizedUrl = url.replace(/\/+$/, '');
      homeAssistant.setConfig({ baseUrl: normalizedUrl, accessToken });
      const result = await homeAssistant.testConnection();

      if (result.success) {
        setResults(prev => ({ ...prev, [url]: 'success' }));
        onUrlSelect(normalizedUrl);
      } else {
        setResults(prev => ({ ...prev, [url]: 'failed' }));
      }
    } catch {
      setResults(prev => ({ ...prev, [url]: 'failed' }));
    } finally {
      setTestingUrl(null);
    }
  };

  const testAllUrls = async () => {
    if (!accessToken) return;

    for (const { url } of COMMON_HA_URLS) {
      setTestingUrl(url);
      try {
        const normalizedUrl = url.replace(/\/+$/, '');
        homeAssistant.setConfig({ baseUrl: normalizedUrl, accessToken });
        const result = await homeAssistant.testConnection();

        if (result.success) {
          setResults(prev => ({ ...prev, [url]: 'success' }));
          onUrlSelect(normalizedUrl);
          setTestingUrl(null);
          return; // Stop on first success
        } else {
          setResults(prev => ({ ...prev, [url]: 'failed' }));
        }
      } catch {
        setResults(prev => ({ ...prev, [url]: 'failed' }));
      }
    }
    setTestingUrl(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">Quick connect suggestions</p>
        <button
          onClick={testAllUrls}
          disabled={!accessToken || testingUrl !== null}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-3 h-3" />
          Auto-detect
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {COMMON_HA_URLS.map(({ url, label, icon: Icon }) => {
          const isActive = currentUrl === url.replace(/\/+$/, '');
          const isTesting = testingUrl === url;
          const result = results[url];

          return (
            <motion.button
              key={url}
              onClick={() => testUrl(url)}
              disabled={!accessToken || testingUrl !== null}
              className={`
                relative flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm
                transition-all duration-200 disabled:cursor-not-allowed
                ${isActive 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-200' 
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>

              <AnimatePresence mode="wait">
                {isTesting && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                  </motion.div>
                )}
                {!isTesting && result === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </motion.div>
                )}
                {!isTesting && result === 'failed' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-2"
                  >
                    <XCircle className="w-4 h-4 text-red-400/50" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {!accessToken && (
        <p className="text-xs text-amber-400/70 flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          Enter your access token first to test connections
        </p>
      )}
    </div>
  );
};