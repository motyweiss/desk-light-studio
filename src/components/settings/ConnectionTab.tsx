import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Link2 } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import { SettingsField } from "./SettingsField";
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
      homeAssistant.setConfig({ baseUrl: normalizedUrl, accessToken });
      const result = await homeAssistant.testConnection();

      if (result.success) {
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <SettingsSection icon={Link2} title="Home Assistant Connection">
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
          <Input
            type="password"
            value={accessToken}
            onChange={(e) => onAccessTokenChange(e.target.value)}
            placeholder="eyJ0eXAiOiJKV1QiLCJhbGc..."
            className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
          />
        </SettingsField>

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
              "Test Connection"
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
