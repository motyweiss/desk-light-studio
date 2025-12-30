import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Plug, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ConnectionTab from "@/components/settings/ConnectionTab";
import DevicesTab from "@/components/settings/DevicesTab";
import SettingsConnectionBadge from "@/components/settings/SettingsConnectionBadge";
import { useHAConnection } from "@/contexts/HAConnectionContext";
import { homeAssistant, type HAEntity } from "@/services/homeAssistant";
import { useToast } from "@/hooks/use-toast";
import { DeviceConfig } from "@/types/settings";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 0.03, 0.26, 1] as const }
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    config: haConfig, 
    isLoading: isLoadingHAConfig,
    isConnected,
    devicesMapping,
    saveConfig: saveHAConfig,
    saveDevicesMapping: saveHADevicesMapping,
    testConnection 
  } = useHAConnection();
  
  const [baseUrl, setBaseUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [localDevicesMapping, setLocalDevicesMapping] = useState(devicesMapping);
  
  const [allEntities, setAllEntities] = useState<HAEntity[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (haConfig) {
      setBaseUrl(haConfig.baseUrl);
      setAccessToken(haConfig.accessToken);
    }
  }, [haConfig]);

  useEffect(() => {
    setLocalDevicesMapping(devicesMapping);
  }, [devicesMapping]);

  useEffect(() => {
    const fetchEntitiesOnLoad = async () => {
      if (haConfig?.baseUrl && haConfig?.accessToken) {
        setIsLoadingEntities(true);
        
        try {
          const entities = await homeAssistant.getEntitiesWithContext();
          setAllEntities(entities);
        } catch (error) {
          console.log("Could not auto-fetch entities on load");
        }
        setIsLoadingEntities(false);
      }
    };
    
    fetchEntitiesOnLoad();
  }, [haConfig]);

  useEffect(() => {
    const hasChanges = 
      baseUrl !== (haConfig?.baseUrl || "") ||
      accessToken !== (haConfig?.accessToken || "") ||
      JSON.stringify(localDevicesMapping) !== JSON.stringify(devicesMapping);
    
    setIsDirty(hasChanges);
  }, [baseUrl, accessToken, localDevicesMapping, haConfig, devicesMapping]);

  const handleAddDevice = (roomId: string, category: 'lights' | 'sensors' | 'mediaPlayers') => {
    const newDevice: DeviceConfig = {
      id: `device_${Date.now()}`,
      label: `New ${category === 'lights' ? 'Light' : category === 'sensors' ? 'Sensor' : 'Media Player'}`,
      entity_id: '',
      type: category === 'sensors' ? 'temperature' : undefined,
    };
    
    setLocalDevicesMapping(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId 
          ? { ...room, [category]: [...room[category], newDevice] }
          : room
      )
    }));
  };

  const handleUpdateDevice = (
    roomId: string, 
    category: 'lights' | 'sensors' | 'mediaPlayers', 
    deviceId: string, 
    updates: Partial<DeviceConfig>
  ) => {
    setLocalDevicesMapping(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId 
          ? {
              ...room,
              [category]: room[category].map((device: DeviceConfig) =>
                device.id === deviceId ? { ...device, ...updates } : device
              )
            }
          : room
      )
    }));
  };

  const handleRemoveDevice = (roomId: string, category: 'lights' | 'sensors' | 'mediaPlayers', deviceId: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this device?');
    if (!confirmed) return;
    
    setLocalDevicesMapping(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId 
          ? {
              ...room,
              [category]: room[category].filter((device: DeviceConfig) => device.id !== deviceId)
            }
          : room
      )
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const configResult = await saveHAConfig(baseUrl, accessToken);
      
      if (!configResult.success) {
        toast({
          title: "Error Saving",
          description: configResult.error || "Failed to save connection settings",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      const devicesResult = await saveHADevicesMapping(localDevicesMapping);
      
      if (!devicesResult.success) {
        toast({
          title: "Error Saving Devices",
          description: devicesResult.error || "Failed to save device mappings",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      toast({
        title: "Settings Saved",
        description: "Your configuration has been saved securely",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }
    navigate("/");
  };

  const isFormValid = baseUrl && accessToken;

  if (isLoadingHAConfig) {
    return (
      <div className="h-full flex items-center justify-center bg-card">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/60" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Fixed Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.03, 0.26, 1] }}
        className="flex-shrink-0 bg-card/90 backdrop-blur-2xl border-b border-border/50"
      >
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleCancel}
              className="w-10 h-10 rounded-full bg-secondary/50 backdrop-blur-xl border border-border/50 flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-border hover:bg-secondary/80 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </motion.button>
            <h1 className="text-xl font-display font-normal text-foreground tracking-tight">
              Settings
            </h1>
          </div>
          <SettingsConnectionBadge />
        </div>
      </motion.div>

      {/* Scrollable Content */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto min-h-0"
      >
        <div className="max-w-2xl mx-auto px-6 py-8 pb-32">
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="connection" className="w-full">
              <TabsList className="w-full mb-8 p-1.5 bg-secondary/30 border border-border/30 rounded-2xl">
                <TabsTrigger 
                  value="connection" 
                  className="flex-1 gap-2 data-[state=active]:bg-secondary data-[state=active]:shadow-lg rounded-xl py-3"
                >
                  <Plug className="w-4 h-4" strokeWidth={1.5} />
                  Connection
                </TabsTrigger>
                <TabsTrigger 
                  value="devices" 
                  className="flex-1 gap-2 data-[state=active]:bg-secondary data-[state=active]:shadow-lg rounded-xl py-3"
                >
                  <Cpu className="w-4 h-4" strokeWidth={1.5} />
                  Devices
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="connection" className="mt-0">
                <ConnectionTab
                  baseUrl={baseUrl}
                  accessToken={accessToken}
                  onBaseUrlChange={setBaseUrl}
                  onAccessTokenChange={setAccessToken}
                  onEntitiesFetched={setAllEntities}
                />
              </TabsContent>
              
              <TabsContent value="devices" className="mt-0">
                <DevicesTab
                  devicesMapping={localDevicesMapping}
                  entities={allEntities}
                  onAddDevice={handleAddDevice}
                  onUpdateDevice={handleUpdateDevice}
                  onRemoveDevice={handleRemoveDevice}
                  isLoading={isLoadingEntities}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </motion.div>

      {/* Fixed Footer - Floating Save Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl shadow-black/30">
              <span className="text-sm text-foreground/70 font-light px-2">Unsaved changes</span>
              <div className="w-px h-6 bg-border/50" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-foreground/60 hover:text-foreground hover:bg-secondary/80"
              >
                Discard
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isFormValid || isSaving}
                size="sm"
                className="bg-warm-glow hover:bg-warm-glow/90 text-primary-foreground font-medium px-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
