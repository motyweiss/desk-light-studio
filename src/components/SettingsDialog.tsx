import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
      mediaPlayer?: string;
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
    mediaPlayer?: string;
  };
}

export const SettingsDialog = ({ open, onOpenChange, onSave, currentConfig, currentMapping }: SettingsDialogProps) => {
  const [activeTab, setActiveTab] = useState("connection");
  const [baseUrl, setBaseUrl] = useState(currentConfig?.baseUrl || "");
  const [accessToken, setAccessToken] = useState(currentConfig?.accessToken || "");
  const [deskLamp, setDeskLamp] = useState(currentMapping.deskLamp || "light.go");
  const [monitorLight, setMonitorLight] = useState(currentMapping.monitorLight || "light.screen");
  const [spotlight, setSpotlight] = useState(currentMapping.spotlight || "light.door");
  const [temperatureSensor, setTemperatureSensor] = useState(currentMapping.temperatureSensor || "sensor.dyson_pure_temperature");
  const [humiditySensor, setHumiditySensor] = useState(currentMapping.humiditySensor || "sensor.dyson_pure_humidity");
  const [airQualitySensor, setAirQualitySensor] = useState(currentMapping.airQualitySensor || "sensor.dyson_pure_pm_2_5");
  const [mediaPlayer, setMediaPlayer] = useState(currentMapping.mediaPlayer || "media_player.spotify");
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; version?: string; error?: string } | null>(null);
  const [availableLights, setAvailableLights] = useState<HAEntity[]>([]);
  const [availableSensors, setAvailableSensors] = useState<HAEntity[]>([]);
  const [availableMediaPlayers, setAvailableMediaPlayers] = useState<HAEntity[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);

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
      setMediaPlayer(currentMapping.mediaPlayer || "media_player.spotify");
    }
  }, [currentConfig, currentMapping]);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    
    const normalizedUrl = baseUrl.replace(/\/+$/, '');
    
    homeAssistant.setConfig({ baseUrl: normalizedUrl, accessToken });
    const result = await homeAssistant.testConnection();
    setConnectionStatus(result);
    
    if (result.success) {
      setIsLoadingEntities(true);
      const [lights, sensors, mediaPlayers] = await Promise.all([
        homeAssistant.getLights(),
        homeAssistant.getSensors(),
        homeAssistant.getMediaPlayers()
      ]);
      setAvailableLights(lights);
      setAvailableSensors(sensors);
      setAvailableMediaPlayers(mediaPlayers);
      
      // Auto-detect Spotify if available
      const spotifyPlayer = mediaPlayers.find(p => 
        p.entity_id.includes('spotify') || 
        p.attributes.friendly_name?.toLowerCase().includes('spotify')
      );
      if (spotifyPlayer && !currentMapping.mediaPlayer) {
        console.log('Auto-detected Spotify:', spotifyPlayer.entity_id);
        setMediaPlayer(spotifyPlayer.entity_id);
      }
      
      setIsLoadingEntities(false);
      
      // Auto-switch to entity mapping tab on success
      setActiveTab("mapping");
    }
    
    setIsTestingConnection(false);
  };

  const handleSave = () => {
    const normalizedUrl = baseUrl.replace(/\/+$/, '');
    
    onSave(
      { baseUrl: normalizedUrl, accessToken },
      { deskLamp, monitorLight, spotlight, temperatureSensor, humiditySensor, airQualitySensor, mediaPlayer }
    );
    onOpenChange(false);
  };

  const isFormValid = baseUrl && accessToken && deskLamp && monitorLight && spotlight && temperatureSensor && humiditySensor && airQualitySensor && mediaPlayer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle 
            className="text-3xl font-light tracking-tight text-white flex items-center gap-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            <span className="text-2xl">⚙️</span> 
            Settings
          </DialogTitle>
          <p className="text-sm text-white/40 font-light pt-1">Configure your Home Assistant connection and entity mappings</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="connection" className="flex-1">Connection</TabsTrigger>
            <TabsTrigger value="mapping" className="flex-1" disabled={!connectionStatus?.success}>
              Entity Mapping
            </TabsTrigger>
          </TabsList>

          {/* Connection Tab */}
          <TabsContent value="connection">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 0.03, 0.26, 1] }}
              className="space-y-5"
            >
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
                  className="h-12"
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
                  className="h-12 font-mono text-sm tracking-tight"
                />
                <p className="text-xs text-white/40 font-light flex items-center gap-1.5">
                  <span className="text-sm">🔒</span> Token is stored securely in your browser
                </p>
              </div>

              {/* Test Connection Button */}
              <div className="pt-2">
                <Button
                  onClick={handleTestConnection}
                  disabled={!baseUrl || !accessToken || isTestingConnection}
                  variant="primary"
                  className="w-full h-12 rounded-xl font-light tracking-wide text-base"
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
            </motion.div>
          </TabsContent>

          {/* Entity Mapping Tab */}
          <TabsContent value="mapping">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 0.03, 0.26, 1] }}
              className="space-y-5"
            >
              {isLoadingEntities ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                </div>
              ) : (
                <>
                  {/* Lights Section */}
                  <div className="space-y-4">
                    <h3 className="text-base font-light text-white/80 tracking-wide">Lights</h3>
                    
                    {/* Desk Lamp */}
                    <div className="space-y-2">
                      <label className="text-sm font-light text-white/60">Desk Lamp</label>
                      <Select value={deskLamp} onValueChange={setDeskLamp}>
                        <SelectTrigger className="h-11">
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
                        <SelectTrigger className="h-11">
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
                        <SelectTrigger className="h-11">
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
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-white/10" />
                  
                  {/* Sensors Section */}
                  <div className="space-y-4">
                    <h3 className="text-base font-light text-white/80 tracking-wide">Climate Sensors</h3>

                    {/* Temperature Sensor */}
                    <div className="space-y-2">
                      <label className="text-sm font-light text-white/60">Temperature Sensor</label>
                      <Select value={temperatureSensor} onValueChange={setTemperatureSensor}>
                        <SelectTrigger className="h-11">
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
                        <SelectTrigger className="h-11">
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
                        <SelectTrigger className="h-11">
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

                  {/* Separator */}
                  <div className="h-px bg-white/10" />

                  {/* Media Player Section */}
                  <div className="space-y-4">
                    <h3 className="text-base font-light text-white/80 tracking-wide">Media Player</h3>

                    {/* Media Player */}
                    <div className="space-y-2">
                      <label className="text-sm font-light text-white/60">Sonos/Media Player</label>
                      <Select value={mediaPlayer} onValueChange={setMediaPlayer}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select media player..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMediaPlayers.map((player) => (
                            <SelectItem key={player.entity_id} value={player.entity_id}>
                              {player.attributes.friendly_name || player.entity_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-6 border-t border-white/10">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)} 
            className="flex-1 h-11 rounded-xl font-light tracking-wide"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!isFormValid}
            className="flex-1 h-11 rounded-xl font-light tracking-wide"
          >
            Save & Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
