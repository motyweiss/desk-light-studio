import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff, Key, RefreshCw, Home } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import { SettingsField } from "./SettingsField";
import { QuickConnectSuggestions } from "./QuickConnectSuggestions";
import { homeAssistant, type HAEntity } from "@/services/homeAssistant";
import { useToast } from "@/hooks/use-toast";

interface ConnectionTabProps {
  baseUrl: string;
  accessToken: string;
  onBaseUrlChange: (value: string) => void;
  onAccessTokenChange: (value: string) => void;
  onEntitiesFetched?: (entities: HAEntity[]) => void;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const ConnectionTab = ({
  baseUrl,
  accessToken,
  onBaseUrlChange,
  onAccessTokenChange,
  onEntitiesFetched,
}: ConnectionTabProps) => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestConnection = async () => {
    if (!baseUrl || !accessToken) {
      setTestResult({
        success: false,
        message: "Please fill in both URL and token",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const normalizedUrl = baseUrl.replace(/\/+$/, '');
      
      const result = await homeAssistant.testDirectConnection(normalizedUrl, accessToken);

      if (result.success) {
        homeAssistant.setConfig({ baseUrl: normalizedUrl, accessToken });
        
        const entities = await homeAssistant.getEntitiesWithContext();
        
        if (onEntitiesFetched) {
          onEntitiesFetched(entities);
        }

        setTestResult({
          success: true,
          message: `Connected successfully! Home Assistant version: ${result.version}`,
        });

        toast({
          title: "Connected",
          description: `Successfully connected to Home Assistant (${result.version})`,
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || "Connection failed",
        });

        toast({
          title: "Connection Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
      });
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Connection failed",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Quick Connect */}
      <motion.div variants={itemVariants}>
        <QuickConnectSuggestions
          currentUrl={baseUrl}
          accessToken={accessToken}
          onUrlSelect={(url) => {
            onBaseUrlChange(url);
            setTimeout(() => {
              if (accessToken) {
                handleTestConnection();
              }
            }, 100);
          }}
        />
      </motion.div>
      
      {/* Connection Settings */}
      <motion.div variants={itemVariants}>
        <SettingsSection icon={Home} title="Home Assistant Connection">
          <div className="space-y-5">
            <SettingsField 
              label="Base URL"
              description="Your Home Assistant instance URL (e.g., http://homeassistant.local:8123)"
            >
              <Input
                value={baseUrl}
                onChange={(e) => onBaseUrlChange(e.target.value)}
                placeholder="http://homeassistant.local:8123"
                className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-warm-glow/50 focus:ring-warm-glow/20 rounded-xl transition-all duration-300"
              />
            </SettingsField>

            <SettingsField
              label="Access Token"
              description="Long-lived access token from Home Assistant"
            >
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={accessToken}
                  onChange={(e) => onAccessTokenChange(e.target.value)}
                  placeholder="eyJ0eXAiOiJKV1QiLCJhbGc..."
                  className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-warm-glow/50 focus:ring-warm-glow/20 pr-12 rounded-xl transition-all duration-300"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 text-white/40 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-all duration-300"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </SettingsField>

            {/* Help text */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
            >
              <Key className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/40 leading-relaxed font-light">
                To get a token: Profile → Security → Long-Lived Access Tokens → Create Token.{" "}
                <a 
                  href="https://www.home-assistant.io/docs/authentication/#your-account-profile" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-warm-glow hover:text-warm-glow/80 underline transition-colors"
                >
                  Learn more
                </a>
              </p>
            </motion.div>

            {/* Test Connection Button */}
            <Button
              onClick={handleTestConnection}
              disabled={testing || !baseUrl || !accessToken}
              className="w-full h-11 bg-white/[0.06] hover:bg-white/[0.1] text-white/90 rounded-xl font-light border border-white/[0.08] hover:border-white/[0.12] transition-all duration-300 disabled:opacity-40"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>

            {/* Test Result */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                className={`flex items-center gap-3 p-4 rounded-xl border ${
                  testResult.success 
                    ? "bg-status-optimal/10 border-status-optimal/20 text-status-optimal" 
                    : "bg-status-critical/10 border-status-critical/20 text-status-critical"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="text-sm font-light">{testResult.message}</span>
              </motion.div>
            )}
          </div>
        </SettingsSection>
      </motion.div>
    </motion.div>
  );
};

export default ConnectionTab;
