import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeviceDiscoveryService } from '@/services/deviceDiscovery';
import { HomeDiscoveryResult, DiscoveredDevice, DeviceType } from '@/types/discovery';
import { useToast } from '@/hooks/use-toast';

interface DeviceDiscoveryContextType {
  discoveryResult: HomeDiscoveryResult | null;
  isDiscovering: boolean;
  lastDiscoveryTime: Date | null;
  error: string | null;
  runDiscovery: () => Promise<void>;
  refreshArea: (areaId: string) => Promise<void>;
  getDevicesByArea: (areaId: string) => DiscoveredDevice[];
  getDevicesByType: (type: DeviceType) => DiscoveredDevice[];
}

const DeviceDiscoveryContext = createContext<DeviceDiscoveryContextType | undefined>(undefined);

export const DeviceDiscoveryProvider = ({ children }: { children: ReactNode }) => {
  const [discoveryResult, setDiscoveryResult] = useState<HomeDiscoveryResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [lastDiscoveryTime, setLastDiscoveryTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const runDiscovery = async () => {
    const haConfig = localStorage.getItem('homeassistant_config');
    if (!haConfig) {
      setError('No Home Assistant configuration found');
      return;
    }

    const config = JSON.parse(haConfig);
    setIsDiscovering(true);
    setError(null);

    try {
      const service = new DeviceDiscoveryService(config);
      const result = await service.discoverHome();
      setDiscoveryResult(result);
      setLastDiscoveryTime(new Date());
      toast({
        title: "Discovery Complete",
        description: `Found ${result.stats.totalDevices} devices in ${result.stats.totalAreas} areas`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      toast({
        title: "Discovery Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const refreshArea = async (areaId: string) => {
    await runDiscovery();
  };

  const getDevicesByArea = (areaId: string): DiscoveredDevice[] => {
    if (!discoveryResult) return [];
    const area = discoveryResult.areas.find(a => a.id === areaId);
    return area?.devices || [];
  };

  const getDevicesByType = (type: DeviceType): DiscoveredDevice[] => {
    if (!discoveryResult) return [];
    const allDevices = [
      ...discoveryResult.areas.flatMap(a => a.devices),
      ...discoveryResult.unassignedDevices
    ];
    return allDevices.filter(d => d.deviceType === type);
  };

  useEffect(() => {
    const haConfig = localStorage.getItem('homeassistant_config');
    if (haConfig) {
      runDiscovery();
    }
  }, []);

  return (
    <DeviceDiscoveryContext.Provider
      value={{
        discoveryResult,
        isDiscovering,
        lastDiscoveryTime,
        error,
        runDiscovery,
        refreshArea,
        getDevicesByArea,
        getDevicesByType
      }}
    >
      {children}
    </DeviceDiscoveryContext.Provider>
  );
};

export const useDeviceDiscovery = () => {
  const context = useContext(DeviceDiscoveryContext);
  if (context === undefined) {
    throw new Error('useDeviceDiscovery must be used within a DeviceDiscoveryProvider');
  }
  return context;
};
