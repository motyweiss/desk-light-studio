import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
          <SettingsConnectionBadge baseUrl={haConfig?.baseUrl || ""} accessToken={haConfig?.accessToken || ""} />
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
            disabled={!isFormValid || isSaving}
            className="flex-1 bg-[hsl(28_18%_12%)] hover:bg-[hsl(28_18%_16%)] text-white border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Apply"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;