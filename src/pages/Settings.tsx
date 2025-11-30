import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Link2, Lightbulb, Thermometer, Music, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsField } from "@/components/settings/SettingsField";
import { EntitySearchSelect } from "@/components/settings/EntitySearchSelect";
import { useHomeAssistantConfig } from "@/hooks/useHomeAssistantConfig";
import { homeAssistant, type HAEntity } from "@/services/homeAssistant";
import { useToast } from "@/hooks/use-toast";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0
  }
};

const sectionTransition = {
  duration: 0.4,
  ease: [0.22, 0.03, 0.26, 1] as const
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config, entityMapping, saveConfig } = useHomeAssistantConfig();
  
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || "");
  const [accessToken, setAccessToken] = useState(config?.accessToken || "");
  const [deskLamp, setDeskLamp] = useState(entityMapping.deskLamp || "light.go");
  const [monitorLight, setMonitorLight] = useState(entityMapping.monitorLight || "light.screen");
  const [spotlight, setSpotlight] = useState(entityMapping.spotlight || "light.door");
  const [temperatureSensor, setTemperatureSensor] = useState(entityMapping.temperatureSensor || "sensor.dyson_pure_temperature");
  const [humiditySensor, setHumiditySensor] = useState(entityMapping.humiditySensor || "sensor.dyson_pure_humidity");
  const [airQualitySensor, setAirQualitySensor] = useState(entityMapping.airQualitySensor || "sensor.dyson_pure_pm_2_5");
  const [mediaPlayer, setMediaPlayer] = useState(entityMapping.mediaPlayer || "media_player.spotify");
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; version?: string; error?: string } | null>(null);
  const [availableLights, setAvailableLights] = useState<HAEntity[]>([]);
  const [availableSensors, setAvailableSensors] = useState<HAEntity[]>([]);
  const [availableMediaPlayers, setAvailableMediaPlayers] = useState<HAEntity[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (config) {
      setBaseUrl(config.baseUrl);
      setAccessToken(config.accessToken);
    }
  }, [config]);

  // Auto-fetch entities when page loads if config exists
  useEffect(() => {
    const fetchEntitiesOnLoad = async () => {
      if (config?.baseUrl && config?.accessToken) {
        setIsLoadingEntities(true);
        homeAssistant.setConfig({ baseUrl: config.baseUrl, accessToken: config.accessToken });
        
        try {
          const entities = await homeAssistant.getEntitiesWithContext();
          const lights = entities.filter(e => e.entity_id.startsWith('light.'));
          const sensors = entities.filter(e => e.entity_id.startsWith('sensor.'));
          const mediaPlayers = entities.filter(e => e.entity_id.startsWith('media_player.'));
          
          setAvailableLights(lights);
          setAvailableSensors(sensors);
          setAvailableMediaPlayers(mediaPlayers);
          setConnectionStatus({ success: true });
        } catch (error) {
          console.log("Could not auto-fetch entities on load");
        }
        setIsLoadingEntities(false);
      }
    };
    
    fetchEntitiesOnLoad();
  }, [config]);

  useEffect(() => {
    const hasChanges = 
      baseUrl !== (config?.baseUrl || "") ||
      accessToken !== (config?.accessToken || "") ||
      deskLamp !== entityMapping.deskLamp ||
      monitorLight !== entityMapping.monitorLight ||
      spotlight !== entityMapping.spotlight ||
      temperatureSensor !== entityMapping.temperatureSensor ||
      humiditySensor !== entityMapping.humiditySensor ||
      airQualitySensor !== entityMapping.airQualitySensor ||
      mediaPlayer !== entityMapping.mediaPlayer;
    
    setIsDirty(hasChanges);
  }, [baseUrl, accessToken, deskLamp, monitorLight, spotlight, temperatureSensor, humiditySensor, airQualitySensor, mediaPlayer, config, entityMapping]);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    
    const normalizedUrl = baseUrl.replace(/\/+$/, '');
    
    homeAssistant.setConfig({ baseUrl: normalizedUrl, accessToken });
    const result = await homeAssistant.testConnection();
    setConnectionStatus(result);
    
    if (result.success) {
      setIsLoadingEntities(true);
      const entities = await homeAssistant.getEntitiesWithContext();
      const lights = entities.filter(e => e.entity_id.startsWith('light.'));
      const sensors = entities.filter(e => e.entity_id.startsWith('sensor.'));
      const mediaPlayers = entities.filter(e => e.entity_id.startsWith('media_player.'));
      
      setAvailableLights(lights);
      setAvailableSensors(sensors);
      setAvailableMediaPlayers(mediaPlayers);
      setIsLoadingEntities(false);
      
      toast({
        title: "Connected",
        description: `Successfully connected to Home Assistant (${result.version})`,
      });
    } else {
      toast({
        title: "Connection Failed",
        description: result.error,
        variant: "destructive",
      });
    }
    
    setIsTestingConnection(false);
  };

  const handleSave = () => {
    const normalizedUrl = baseUrl.replace(/\/+$/, '');
    
    saveConfig(
      { baseUrl: normalizedUrl, accessToken },
      { deskLamp, monitorLight, spotlight, temperatureSensor, humiditySensor, airQualitySensor, mediaPlayer }
    );
    
    toast({
      title: "Settings Saved",
      description: "Your configuration has been saved successfully",
    });
    
    navigate("/");
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }
    navigate("/");
  };

  const isFormValid = baseUrl && accessToken && deskLamp && monitorLight && spotlight && temperatureSensor && humiditySensor && airQualitySensor && mediaPlayer;

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <motion.div 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 0.03, 0.26, 1] }}
        className="flex-shrink-0 bg-background/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-light">Back</span>
          </button>
          <h1 
            className="text-3xl font-light text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Settings
          </h1>
          <div className="w-20" />
        </div>
      </motion.div>

      {/* Scrollable Content */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto min-h-0"
      >
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6 pb-24">
          {/* Connection Section */}
          <motion.div variants={sectionVariants} transition={sectionTransition}>
            <SettingsSection icon={Link2} title="Connection">
              {/* Connection Status Banner */}
              {connectionStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`p-4 rounded-xl backdrop-blur-xl border ${
                    connectionStatus.success
                      ? "bg-green-500/[0.08] border-green-400/30"
                      : "bg-red-500/[0.08] border-red-400/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {connectionStatus.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-light ${
                      connectionStatus.success ? "text-green-200" : "text-red-200"
                    }`}>
                      {connectionStatus.success
                        ? `Connected successfully! Version: ${connectionStatus.version}`
                        : `Connection failed: ${connectionStatus.error}`}
                    </span>
                  </div>
                </motion.div>
              )}

              <SettingsField
                label="Base URL"
                description="Your Home Assistant instance URL (with port if needed)"
              >
                <Input
                  type="text"
                  placeholder="https://your-home-assistant.duckdns.org:8123"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </SettingsField>

              <SettingsField
                label="Long-Lived Access Token"
                description="Token is stored securely in your browser"
              >
                <Input
                  type="password"
                  placeholder="Enter your Home Assistant token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="font-mono text-sm tracking-tight"
                />
              </SettingsField>

              {(!connectionStatus?.success || isDirty) && (
                <Button
                  onClick={handleTestConnection}
                  disabled={!baseUrl || !accessToken || isTestingConnection}
                  variant="primary"
                  className="w-full h-12 rounded-xl font-light tracking-wide"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {connectionStatus?.success ? "Refreshing..." : "Testing Connection..."}
                    </>
                  ) : (
                    connectionStatus?.success ? "Refresh Entities" : "Test Connection"
                  )}
                </Button>
              )}
            </SettingsSection>
          </motion.div>

          {/* Lights Section */}
          <motion.div variants={sectionVariants} transition={sectionTransition}>
              <SettingsSection icon={Lightbulb} title="Lights">
                <SettingsField label="Desk Lamp">
                  <EntitySearchSelect
                    value={deskLamp}
                    onValueChange={setDeskLamp}
                    entities={availableLights}
                    entityType="light"
                    placeholder="Search lights..."
                    isLoading={isLoadingEntities}
                  />
                </SettingsField>

                <SettingsField label="Monitor Light">
                  <EntitySearchSelect
                    value={monitorLight}
                    onValueChange={setMonitorLight}
                    entities={availableLights}
                    entityType="light"
                    placeholder="Search lights..."
                    isLoading={isLoadingEntities}
                  />
                </SettingsField>

                <SettingsField label="Spotlight">
                  <EntitySearchSelect
                    value={spotlight}
                    onValueChange={setSpotlight}
                    entities={availableLights}
                    entityType="light"
                    placeholder="Search lights..."
                    isLoading={isLoadingEntities}
                  />
                </SettingsField>
              </SettingsSection>
            </motion.div>

          {/* Climate Sensors Section */}
          <motion.div variants={sectionVariants} transition={sectionTransition}>
              <SettingsSection icon={Thermometer} title="Climate Sensors">
                <SettingsField label="Temperature Sensor">
                  <EntitySearchSelect
                    value={temperatureSensor}
                    onValueChange={setTemperatureSensor}
                    entities={availableSensors}
                    entityType="sensor"
                    sensorType="temperature"
                    placeholder="Search temperature sensors..."
                    isLoading={isLoadingEntities}
                  />
                </SettingsField>

                <SettingsField label="Humidity Sensor">
                  <EntitySearchSelect
                    value={humiditySensor}
                    onValueChange={setHumiditySensor}
                    entities={availableSensors}
                    entityType="sensor"
                    sensorType="humidity"
                    placeholder="Search humidity sensors..."
                    isLoading={isLoadingEntities}
                  />
                </SettingsField>

                <SettingsField label="Air Quality (PM 2.5)">
                  <EntitySearchSelect
                    value={airQualitySensor}
                    onValueChange={setAirQualitySensor}
                    entities={availableSensors}
                    entityType="sensor"
                    sensorType="air_quality"
                    placeholder="Search air quality sensors..."
                    isLoading={isLoadingEntities}
                  />
                </SettingsField>
              </SettingsSection>
            </motion.div>

          {/* Media Player Section */}
          <motion.div variants={sectionVariants} transition={sectionTransition}>
              <SettingsSection icon={Music} title="Media Player">
                <SettingsField label="Spotify/Sonos Device">
                  <EntitySearchSelect
                    value={mediaPlayer}
                    onValueChange={setMediaPlayer}
                    entities={availableMediaPlayers}
                    entityType="media_player"
                    placeholder="Search media players..."
                    isLoading={isLoadingEntities}
                  />
                </SettingsField>
              </SettingsSection>
            </motion.div>
        </div>
      </motion.div>

      {/* Fixed Footer */}
      <motion.div 
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 0.03, 0.26, 1] }}
        className="flex-shrink-0 bg-background/80 backdrop-blur-xl border-t border-white/10"
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            className="flex-1 bg-[hsl(28_18%_12%)] hover:bg-[hsl(28_18%_16%)] text-white border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Save & Apply
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
