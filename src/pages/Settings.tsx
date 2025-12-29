import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
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
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use the global HAConnection context - Single Source of Truth
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

  // Initialize form with config from context
  useEffect(() => {
    if (haConfig) {
      setBaseUrl(haConfig.baseUrl);
      setAccessToken(haConfig.accessToken);
    }
  }, [haConfig]);

  useEffect(() => {
    setLocalDevicesMapping(devicesMapping);
  }, [devicesMapping]);

  // Auto-fetch entities when page loads if config exists
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
      // Save connection config to database via context
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
      
      // Save devices mapping to database via context
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
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
        className="flex-shrink-0 bg-background/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            onClick={handleCancel}
            className="w-10 h-10 rounded-full backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </motion.button>
          <h1 className="text-xl font-sans font-medium text-white">
            Settings
          </h1>
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
        <div className="max-w-2xl mx-auto px-6 py-8 pb-24">
          <Tabs defaultValue="connection" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="connection" className="flex-1">Connection</TabsTrigger>
              <TabsTrigger value="devices" className="flex-1">Devices</TabsTrigger>
              <TabsTrigger value="rooms" className="flex-1" disabled>Rooms</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connection">
              <ConnectionTab
                baseUrl={baseUrl}
                accessToken={accessToken}
                onBaseUrlChange={setBaseUrl}
                onAccessTokenChange={setAccessToken}
                onEntitiesFetched={setAllEntities}
              />
            </TabsContent>
            
            <TabsContent value="devices">
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
        </div>
      </motion.div>

      {/* Fixed Footer - Only shown when there are changes */}
      <AnimatePresence>
        {isDirty && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.25, 
              ease: [0.22, 0.03, 0.26, 1] 
            }}
            className="flex-shrink-0 bg-background/80 backdrop-blur-xl border-t border-white/10"
          >
            <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Discard
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isFormValid || isSaving}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-border disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
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