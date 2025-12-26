import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff, HelpCircle, RefreshCw, Home } from "lucide-react";
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
      
      // Use direct connection test (bypasses Supabase auth requirement)
      const result = await homeAssistant.testDirectConnection(normalizedUrl, accessToken);

      if (result.success) {
        // Set config for future use
        homeAssistant.setConfig({ baseUrl: normalizedUrl, accessToken });
        
        // Fetch entities after successful connection
        const entities = await homeAssistant.getEntitiesWithContext();
        
        // Notify parent component of fetched entities
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 0.03, 0.26, 1] }}
      className="space-y-8"
    >
      <SettingsSection icon={Home} iconClassName="w-5 h-5 text-yellow-400" title="Home Assistant Connection">
        {/* Quick Connect Suggestions */}
        <QuickConnectSuggestions
          currentUrl={baseUrl}
          accessToken={accessToken}
          onUrlSelect={(url) => {
            onBaseUrlChange(url);
            // Auto-trigger test after URL selection
            setTimeout(() => {
              if (accessToken) {
                handleTestConnection();
              }
            }, 100);
          }}
        />

        <div className="h-px bg-white/10 my-4" />

        <SettingsField 
          label="Base URL"
          description="Your Home Assistant instance URL (e.g., http://homeassistant.local:8123)"
        >
          <Input
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            placeholder="http://homeassistant.local:8123"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
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
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
            >
              {showToken ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </SettingsField>

        {/* Token Help */}
        <div className="pt-4 mt-4 border-t border-white/10">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/50 leading-relaxed">
              To create a token: Go to your Home Assistant → Profile → Long-Lived Access Tokens → Create Token.{" "}
              <a 
                href="https://www.home-assistant.io/docs/authentication/#your-account-profile" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 underline transition-colors"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handleTestConnection}
            disabled={testing || !baseUrl || !accessToken}
            className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/20"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>

          {testResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-start gap-3 p-4 rounded-lg ${
                testResult.success
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  testResult.success ? "text-green-100" : "text-red-100"
                }`}
              >
                {testResult.message}
              </p>
            </motion.div>
          )}
        </div>
      </SettingsSection>
    </motion.div>
  );
};

export default ConnectionTab;
