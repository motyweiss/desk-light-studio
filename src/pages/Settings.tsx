import { useState, useEffect, useMemo, useCallback } from "react";
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

// Internal animation variants (RootLayout handles page enter/exit)
const headerVariants = {
  initial: { 
    opacity: 0, 
    y: -16,
    filter: "blur(6px)"
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      delay: 0.1,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

const contentVariants = {
  initial: { 
    opacity: 0, 
    y: 16,
    filter: "blur(4px)"
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      delay: 0.15, // Slightly after header
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

const floatBarVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
    filter: "blur(4px)"
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const
    }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    scale: 0.98,
    filter: "blur(4px)",
    transition: {
      duration: 0.25
    }
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

  const handleAddDevice = useCallback((roomId: string, category: 'lights' | 'sensors' | 'mediaPlayers') => {
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
  }, []);

  const handleUpdateDevice = useCallback((
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
  }, []);

  const handleRemoveDevice = useCallback((roomId: string, category: 'lights' | 'sensors' | 'mediaPlayers', deviceId: string) => {
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
  }, []);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-warm-glow animate-pulse" />
          <span className="text-sm text-white/50 font-light">Loading settings...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects - matching Index.tsx aesthetic */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-warm-glow/[0.02] via-transparent to-transparent" />
        
        {/* Vignette effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)'
          }}
        />
        
        {/* Grain texture */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
      </div>

      {/* Fixed Header */}
      <motion.header 
        variants={headerVariants}
        initial="initial"
        animate="animate"
        className="fixed top-0 left-0 right-0 z-50 px-4 py-4 bg-background/40 backdrop-blur-2xl border-b border-white/[0.06]"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white/90 transition-all duration-300 border border-white/[0.06] hover:border-white/[0.1]"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <h1 className="text-xl font-page-title text-white/90 tracking-wide">Settings</h1>
          </div>
          
          <SettingsConnectionBadge />
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        variants={contentVariants}
        initial="initial"
        animate="animate"
        className="pt-24 pb-32 px-4"
      >
        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="connection" className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <TabsList className="w-full mb-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-1.5 rounded-2xl">
                <TabsTrigger 
                  value="connection" 
                  className="flex-1 gap-2 rounded-xl py-2.5 text-sm font-light data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none text-white/50 transition-all duration-300"
                >
                  <Plug className="w-4 h-4" strokeWidth={1.5} />
                  Connection
                </TabsTrigger>
                <TabsTrigger 
                  value="devices" 
                  className="flex-1 gap-2 rounded-xl py-2.5 text-sm font-light data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none text-white/50 transition-all duration-300"
                >
                  <Cpu className="w-4 h-4" strokeWidth={1.5} />
                  Devices
                </TabsTrigger>
              </TabsList>
            </motion.div>

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
        </div>
      </motion.main>

      {/* Floating Save Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            variants={floatBarVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed bottom-6 left-4 right-4 z-50"
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/30">
                <span className="text-sm text-white/70 font-light">Unsaved changes</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-9 px-4 text-sm font-light text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-300"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!isFormValid || isSaving}
                    className="h-9 px-5 text-sm font-light bg-warm-glow/90 hover:bg-warm-glow text-black rounded-xl transition-all duration-300 disabled:opacity-40"
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
