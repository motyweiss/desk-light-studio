import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ConnectionTab from "@/components/settings/ConnectionTab";
import DevicesTab from "@/components/settings/DevicesTab";
import { useHomeAssistantConfig } from "@/hooks/useHomeAssistantConfig";
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
  const { config, devicesMapping, saveConfig, saveDevicesMapping, addDevice, updateDevice, removeDevice } = useHomeAssistantConfig();
  
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || "");
  const [accessToken, setAccessToken] = useState(config?.accessToken || "");
  const [localDevicesMapping, setLocalDevicesMapping] = useState(devicesMapping);
  
  const [allEntities, setAllEntities] = useState<HAEntity[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (config) {
      setBaseUrl(config.baseUrl);
      setAccessToken(config.accessToken);
    }
  }, [config]);

  useEffect(() => {
    setLocalDevicesMapping(devicesMapping);
  }, [devicesMapping]);

  // Auto-fetch entities when page loads if config exists
  useEffect(() => {
    const fetchEntitiesOnLoad = async () => {
      if (config?.baseUrl && config?.accessToken) {
        setIsLoadingEntities(true);
        homeAssistant.setConfig({ baseUrl: config.baseUrl, accessToken: config.accessToken });
        
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
  }, [config]);

  useEffect(() => {
    const hasChanges = 
      baseUrl !== (config?.baseUrl || "") ||
      accessToken !== (config?.accessToken || "") ||
      JSON.stringify(localDevicesMapping) !== JSON.stringify(devicesMapping);
    
    setIsDirty(hasChanges);
  }, [baseUrl, accessToken, localDevicesMapping, config, devicesMapping]);

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

  const handleSave = () => {
    const normalizedUrl = baseUrl.replace(/\/+$/, '');
    
    // Save connection config
    saveConfig(
      { baseUrl: normalizedUrl, accessToken },
      {} as any // Legacy format will be generated from devicesMapping
    );
    
    // Save devices mapping
    saveDevicesMapping(localDevicesMapping);
    
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

  const isFormValid = baseUrl && accessToken;

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
