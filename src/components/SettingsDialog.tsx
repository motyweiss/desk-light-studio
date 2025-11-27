import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { homeAssistant, type HAEntity } from "@/services/homeAssistant";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: { baseUrl: string; accessToken: string }, mapping: { deskLamp?: string; monitorLight?: string; spotlight?: string }) => void;
  currentConfig: { baseUrl: string; accessToken: string } | null;
  currentMapping: { deskLamp?: string; monitorLight?: string; spotlight?: string };
}

export const SettingsDialog = ({ open, onOpenChange, onSave, currentConfig, currentMapping }: SettingsDialogProps) => {
  const [baseUrl, setBaseUrl] = useState(currentConfig?.baseUrl || "https://4q8tnepf0wp8hemaazk4ftgeuprqycwx.ui.nabu.casa");
  const [accessToken, setAccessToken] = useState(currentConfig?.accessToken || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjMTg5MDdmNGIwZjc0MTMwOWMwNjVhOGQ5ZWMzZTVkMyIsImlhdCI6MTc2NDI1MjkzMCwiZXhwIjoyMDc5NjEyOTMwfQ.8Bf9hCZxENEek09mImxvbfFP4RsnkS-Twf61m9CeKsw");
  const [deskLamp, setDeskLamp] = useState(currentMapping.deskLamp || "light.go");
  const [monitorLight, setMonitorLight] = useState(currentMapping.monitorLight || "light.screen");
  const [spotlight, setSpotlight] = useState(currentMapping.spotlight || "light.door");
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; version?: string; error?: string } | null>(null);
  const [availableLights, setAvailableLights] = useState<HAEntity[]>([]);
  const [isLoadingLights, setIsLoadingLights] = useState(false);

  useEffect(() => {
    if (currentConfig) {
      setBaseUrl(currentConfig.baseUrl);
      setAccessToken(currentConfig.accessToken);
    }
    if (currentMapping) {
      setDeskLamp(currentMapping.deskLamp || "light.go");
      setMonitorLight(currentMapping.monitorLight || "light.screen");
      setSpotlight(currentMapping.spotlight || "light.door");
    }
  }, [currentConfig, currentMapping]);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    
    // Normalize URL by removing trailing slashes
    const normalizedUrl = baseUrl.replace(/\/+$/, '');
    
    homeAssistant.setConfig({ baseUrl: normalizedUrl, accessToken });
    const result = await homeAssistant.testConnection();
    setConnectionStatus(result);
    
    if (result.success) {
      setIsLoadingLights(true);
      const lights = await homeAssistant.getLights();
      setAvailableLights(lights);
      setIsLoadingLights(false);
    }
    
    setIsTestingConnection(false);
  };

  const handleSave = () => {
    // Normalize URL by removing trailing slashes
    const normalizedUrl = baseUrl.replace(/\/+$/, '');
    
    onSave(
      { baseUrl: normalizedUrl, accessToken },
      { deskLamp, monitorLight, spotlight }
    );
    onOpenChange(false);
  };

  const isFormValid = baseUrl && accessToken && deskLamp && monitorLight && spotlight;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light flex items-center gap-2">
            <span>⚙️</span> Home Assistant Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Connection Status */}
          <AnimatePresence mode="wait">
            {connectionStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3 rounded-lg border ${
                  connectionStatus.success
                    ? "bg-green-500/10 border-green-500/30 text-green-300"
                    : "bg-red-500/10 border-red-500/30 text-red-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {connectionStatus.success ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm font-light">
                    {connectionStatus.success
                      ? `Connected successfully! Version: ${connectionStatus.version}`
                      : `Connection failed: ${connectionStatus.error}`}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Base URL */}
          <div className="space-y-2">
            <label className="text-sm font-light text-foreground/80">Base URL</label>
            <Input
              type="text"
              placeholder="https://your-home-assistant.duckdns.org:8123"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
            <p className="text-xs text-foreground/50">Your Home Assistant instance URL (with port if needed)</p>
          </div>

          {/* Access Token */}
          <div className="space-y-2">
            <label className="text-sm font-light text-foreground/80">Long-Lived Access Token</label>
            <Input
              type="password"
              placeholder="Enter your Home Assistant token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
            <p className="text-xs text-foreground/50 flex items-center gap-1">
              🔒 Token is stored securely in your browser
            </p>
          </div>

          {/* Test Connection Button */}
          <div>
            <Button
              onClick={handleTestConnection}
              disabled={!baseUrl || !accessToken || isTestingConnection}
              variant="primary"
              className="w-full"
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>

          {/* Entity Mapping */}
          {connectionStatus?.success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 pt-4 border-t border-white/10"
            >
              <h3 className="text-sm font-light text-foreground/80">Entity Mapping</h3>
              
              {isLoadingLights ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
                </div>
              ) : (
                <>
                  {/* Desk Lamp */}
                  <div className="space-y-2">
                    <label className="text-sm font-light text-foreground/60">Desk Lamp</label>
                    <Select value={deskLamp} onValueChange={setDeskLamp}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLights.map((light) => (
                          <SelectItem key={light.entity_id} value={light.entity_id}>
                            {light.attributes.friendly_name || light.entity_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Monitor Light */}
                  <div className="space-y-2">
                    <label className="text-sm font-light text-foreground/60">Monitor Light</label>
                    <Select value={monitorLight} onValueChange={setMonitorLight}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLights.map((light) => (
                          <SelectItem key={light.entity_id} value={light.entity_id}>
                            {light.attributes.friendly_name || light.entity_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Spotlight */}
                  <div className="space-y-2">
                    <label className="text-sm font-light text-foreground/60">Spotlight</label>
                    <Select value={spotlight} onValueChange={setSpotlight}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLights.map((light) => (
                          <SelectItem key={light.entity_id} value={light.entity_id}>
                            {light.attributes.friendly_name || light.entity_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!isFormValid}
            className="flex-1"
          >
            Save & Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
