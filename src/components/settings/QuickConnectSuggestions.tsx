import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Zap, Globe, Server, Clock, X, Cloud } from "lucide-react";
import { homeAssistant } from "@/services/homeAssistant";

const RECENT_URLS_KEY = "ha_recent_urls";
const MAX_RECENT_URLS = 3;

interface RecentUrl {
  url: string;
  label: string;
  lastUsed: number;
}

interface QuickConnectSuggestionsProps {
  onUrlSelect: (url: string) => void;
  currentUrl: string;
  accessToken: string;
}

const COMMON_HA_URLS = [
  { url: "https://YOUR-ID.ui.nabu.casa", label: "Nabu Casa Cloud", icon: Cloud, isTemplate: true },
  { url: "http://homeassistant.local:8123", label: "homeassistant.local", icon: Globe },
  { url: "http://homeassistant:8123", label: "homeassistant", icon: Server },
  { url: "http://192.168.1.1:8123", label: "192.168.1.1", icon: Server },
];

const getRecentUrls = (): RecentUrl[] => {
  try {
    const saved = localStorage.getItem(RECENT_URLS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveRecentUrl = (url: string) => {
  const recent = getRecentUrls();
  const normalizedUrl = url.replace(/\/+$/, '');
  
  // Extract label from URL
  let label = normalizedUrl;
  try {
    const parsed = new URL(normalizedUrl);
    label = parsed.hostname + (parsed.port ? `:${parsed.port}` : '');
  } catch {
    label = normalizedUrl.replace(/^https?:\/\//, '');
  }

  // Remove if already exists
  const filtered = recent.filter(r => r.url !== normalizedUrl);
  
  // Add to front
  const updated: RecentUrl[] = [
    { url: normalizedUrl, label, lastUsed: Date.now() },
    ...filtered
  ].slice(0, MAX_RECENT_URLS);

  localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(updated));
  return updated;
};

const removeRecentUrl = (url: string): RecentUrl[] => {
  const recent = getRecentUrls();
  const updated = recent.filter(r => r.url !== url);
  localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(updated));
  return updated;
};

export const QuickConnectSuggestions = ({ 
  onUrlSelect, 
  currentUrl,
  accessToken 
}: QuickConnectSuggestionsProps) => {
  const [testingUrl, setTestingUrl] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, 'success' | 'failed' | null>>({});
  const [recentUrls, setRecentUrls] = useState<RecentUrl[]>([]);

  useEffect(() => {
    setRecentUrls(getRecentUrls());
  }, []);

  const testUrl = async (url: string, saveOnSuccess = true) => {
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
        if (saveOnSuccess) {
          setRecentUrls(saveRecentUrl(normalizedUrl));
        }
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
          setRecentUrls(saveRecentUrl(normalizedUrl));
          onUrlSelect(normalizedUrl);
          setTestingUrl(null);
          return;
        } else {
          setResults(prev => ({ ...prev, [url]: 'failed' }));
        }
      } catch {
        setResults(prev => ({ ...prev, [url]: 'failed' }));
      }
    }
    setTestingUrl(null);
  };

  const handleRemoveRecent = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    setRecentUrls(removeRecentUrl(url));
  };

  return (
    <div className="space-y-4">
      {/* Recent Connections */}
      {recentUrls.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/50 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Recent connections
          </p>
          <div className="flex flex-wrap gap-2">
            {recentUrls.map(({ url, label }) => {
              const isActive = currentUrl === url;
              const isTesting = testingUrl === url;
              const result = results[url];

              return (
                <motion.button
                  key={url}
                  onClick={() => testUrl(url, false)}
                  disabled={!accessToken || testingUrl !== null}
                  className={`
                    group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                    transition-all duration-200 disabled:cursor-not-allowed
                    ${isActive 
                      ? 'bg-green-500/20 border border-green-500/30 text-green-200' 
                      : 'bg-amber-500/10 border border-amber-500/20 text-amber-200 hover:bg-amber-500/20'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate max-w-[140px]">{label}</span>

                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemoveRecent(e, url)}
                    className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-white/10 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>

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
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </motion.div>
                    )}
                    {!isTesting && result === 'failed' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <XCircle className="w-4 h-4 text-red-400/50" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Common URLs */}
      <div className="space-y-2">
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
          {COMMON_HA_URLS.map(({ url, label, icon: Icon, isTemplate }) => {
            const isActive = currentUrl === url.replace(/\/+$/, '');
            const isTesting = testingUrl === url;
            const result = results[url];

            // For Nabu Casa template, show as info card not clickable test
            if (isTemplate) {
              return (
                <motion.div
                  key={url}
                  className="col-span-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm bg-blue-500/10 border border-blue-500/20 text-blue-200"
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  <div className="flex-1">
                    <span className="font-medium">{label}</span>
                    <p className="text-xs text-blue-300/60 mt-0.5">
                      Use your Nabu Casa URL: https://xxxxx.ui.nabu.casa
                    </p>
                  </div>
                </motion.div>
              );
            }

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