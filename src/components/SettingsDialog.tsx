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
  onSave: (
    config: { baseUrl: string; accessToken: string }, 
    mapping: { 
      deskLamp?: string; 
      monitorLight?: string; 
      spotlight?: string;
      temperatureSensor?: string;
      humiditySensor?: string;
      airQualitySensor?: string;
    }
  ) => void;
  currentConfig: { baseUrl: string; accessToken: string } | null;
  currentMapping: { 
    deskLamp?: string; 
    monitorLight?: string; 
    spotlight?: string;
    temperatureSensor?: string;
    humiditySensor?: string;
    airQualitySensor?: string;
  };
}

export const SettingsDialog = ({ open, onOpenChange, onSave, currentConfig, currentMapping }: SettingsDialogProps) => {
  const [baseUrl, setBaseUrl] = useState(currentConfig?.baseUrl || "");
  const [accessToken, setAccessToken] = useState(currentConfig?.accessToken || "");
  const [deskLamp, setDeskLamp] = useState(currentMapping.deskLamp || "light.go");
  const [monitorLight, setMonitorLight] = useState(currentMapping.monitorLight || "light.screen");
  const [spotlight, setSpotlight] = useState(currentMapping.spotlight || "light.door");
  const [temperatureSensor, setTemperatureSensor] = useState(currentMapping.temperatureSensor || "sensor.dyson_pure_temperature");
  const [humiditySensor, setHumiditySensor] = useState(currentMapping.humiditySensor || "sensor.dyson_pure_humidity");
  const [airQualitySensor, setAirQualitySensor] = useState(currentMapping.airQualitySensor || "sensor.dyson_pure_pm_2_5");
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; version?: string; error?: string } | null>(null);
  const [availableLights, setAvailableLights] = useState<HAEntity[]>([]);
  const [availableSensors, setAvailableSensors] = useState<HAEntity[]>([]);
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
      setTemperatureSensor(currentMapping.temperatureSensor || "sensor.dyson_pure_temperature");
      setHumiditySensor(currentMapping.humiditySensor || "sensor.dyson_pure_humidity");
      setAirQualitySensor(currentMapping.airQualitySensor || "sensor.dyson_pure_pm_2_5");
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
      const [lights, sensors] = await Promise.all([
        homeAssistant.getLights(),
        homeAssistant.getSensors()
      ]);
      setAvailableLights(lights);
      setAvailableSensors(sensors);
      setIsLoadingLights(false);
    }
    
    setIsTestingConnection(false);
  };

  const handleSave = () => {
    // Normalize URL by removing trailing slashes
    const normalizedUrl = baseUrl.replace(/\/+$/, '');
    
    onSave(
      { baseUrl: normalizedUrl, accessToken },
      { deskLamp, monitorLight, spotlight, temperatureSensor, humiditySensor, airQualitySensor }
    );
    onOpenChange(false);
  };

  const isFormValid = baseUrl && accessToken && deskLamp && monitorLight && spotlight && temperatureSensor && humiditySensor && airQualitySensor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/[0.08] backdrop-blur-[40px] border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <DialogHeader>
          <DialogTitle 
            className="text-3xl font-light tracking-tight text-foreground flex items-center gap-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            <span className="text-2xl">⚙️</span> 
            Home Assistant Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Connection Status */}
          <AnimatePresence mode="wait">
            {connectionStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.22, 0.03, 0.26, 1] }}
                className={`p-4 rounded-xl backdrop-blur-xl border ${
                  connectionStatus.success
                    ? "bg-green-500/[0.08] border-green-400/30 text-green-200"
                    : "bg-red-500/[0.08] border-red-400/30 text-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {connectionStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
          <div className="space-y-3">
            <label className="text-sm font-light text-white/70 tracking-wide">Base URL</label>
            <Input
              type="text"
              placeholder="https://your-home-assistant.duckdns.org:8123"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="h-12 rounded-xl bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[hsl(43_88%_60%/0.3)] focus-visible:border-[hsl(43_88%_60%/0.5)] transition-all duration-200"
            />
            <p className="text-xs text-white/40 font-light">Your Home Assistant instance URL (with port if needed)</p>
          </div>

          {/* Access Token */}
          <div className="space-y-3">
            <label className="text-sm font-light text-white/70 tracking-wide">Long-Lived Access Token</label>
            <Input
              type="password"
              placeholder="Enter your Home Assistant token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="h-12 rounded-xl bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[hsl(43_88%_60%/0.3)] focus-visible:border-[hsl(43_88%_60%/0.5)] transition-all duration-200 font-mono text-sm tracking-tight"
            />
            <p className="text-xs text-white/40 font-light flex items-center gap-1.5">
              <span className="text-sm">🔒</span> Token is stored securely in your browser
            </p>
          </div>

          {/* Test Connection Button */}
          <div>
            <Button
              onClick={handleTestConnection}
              disabled={!baseUrl || !accessToken || isTestingConnection}
              className="w-full h-12 rounded-xl bg-[hsl(43_88%_60%)] hover:bg-[hsl(43_88%_65%)] text-white font-light tracking-wide text-base border-0 shadow-[0_4px_16px_hsl(43_88%_60%/0.25)] disabled:opacity-40 disabled:shadow-none transition-all duration-200"
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
              transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
              className="space-y-5 pt-6 border-t border-white/10"
            >
              <h3 className="text-base font-light text-white/80 tracking-wide">Entity Mapping</h3>
              
              {isLoadingLights ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Desk Lamp */}
                  <div className="space-y-2">
                    <label className="text-sm font-light text-white/60">Desk Lamp</label>
                    <Select value={deskLamp} onValueChange={setDeskLamp}>
                      <SelectTrigger className="h-11 rounded-xl bg-white/[0.06] border-white/15 text-white">
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
                    <label className="text-sm font-light text-white/60">Monitor Light</label>
                    <Select value={monitorLight} onValueChange={setMonitorLight}>
                      <SelectTrigger className="h-11 rounded-xl bg-white/[0.06] border-white/15 text-white">
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
                    <label className="text-sm font-light text-white/60">Spotlight</label>
                    <Select value={spotlight} onValueChange={setSpotlight}>
                      <SelectTrigger className="h-11 rounded-xl bg-white/[0.06] border-white/15 text-white">
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

                  {/* Sensor Section */}
                  <div className="h-px bg-white/10 my-6" />
                  
                  <h3 className="text-base font-light text-white/80 tracking-wide mb-4">Climate Sensors</h3>

                  {/* Temperature Sensor */}
                  <div className="space-y-2">
                    <label className="text-sm font-light text-white/60">Temperature Sensor</label>
                    <Select value={temperatureSensor} onValueChange={setTemperatureSensor}>
                      <SelectTrigger className="h-11 rounded-xl bg-white/[0.06] border-white/15 text-white">
                        <SelectValue placeholder="Select sensor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSensors.map((sensor) => (
                          <SelectItem key={sensor.entity_id} value={sensor.entity_id}>
                            {sensor.attributes.friendly_name || sensor.entity_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Humidity Sensor */}
                  <div className="space-y-2">
                    <label className="text-sm font-light text-white/60">Humidity Sensor</label>
                    <Select value={humiditySensor} onValueChange={setHumiditySensor}>
                      <SelectTrigger className="h-11 rounded-xl bg-white/[0.06] border-white/15 text-white">
                        <SelectValue placeholder="Select sensor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSensors.map((sensor) => (
                          <SelectItem key={sensor.entity_id} value={sensor.entity_id}>
                            {sensor.attributes.friendly_name || sensor.entity_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Air Quality Sensor */}
                  <div className="space-y-2">
                    <label className="text-sm font-light text-white/60">PM 2.5 Sensor</label>
                    <Select value={airQualitySensor} onValueChange={setAirQualitySensor}>
                      <SelectTrigger className="h-11 rounded-xl bg-white/[0.06] border-white/15 text-white">
                        <SelectValue placeholder="Select sensor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSensors.map((sensor) => (
                          <SelectItem key={sensor.entity_id} value={sensor.entity_id}>
                            {sensor.attributes.friendly_name || sensor.entity_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-6 border-t border-white/10">
          <Button 
            onClick={() => onOpenChange(false)} 
            className="flex-1 h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/15 font-light tracking-wide"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            className="flex-1 h-11 rounded-xl bg-[hsl(43_88%_60%)] hover:bg-[hsl(43_88%_65%)] text-white font-light tracking-wide border-0 shadow-[0_4px_16px_hsl(43_88%_60%/0.25)] disabled:opacity-40 disabled:shadow-none transition-all duration-200"
          >
            Save & Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
