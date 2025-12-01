import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeviceDiscoveryService } from '@/services/deviceDiscovery';
import { HomeDiscoveryResult, DiscoveredDevice, DeviceType } from '@/types/discovery';
import { AutoAssignmentService } from '@/services/autoAssignment';
import { useToast } from '@/hooks/use-toast';

const getDemoData = (): HomeDiscoveryResult => {
  return {
    areas: [
      {
        id: 'living_room',
        name: 'Living Room',
        icon: '🛋️',
        devices: [
          {
            id: 'light.living_room_main',
            name: 'Living Room Main Light',
            deviceType: 'light' as DeviceType,
            manufacturer: 'Philips',
            model: 'Hue White',
            primaryEntity: 'light.living_room_main',
            entities: [
              {
                entity_id: 'light.living_room_main',
                friendly_name: 'Living Room Main Light',
                state: 'on',
                domain: 'light',
                attributes: { brightness: 204 },
                capabilities: ['brightness', 'color_temp'],
                device_class: null
              }
            ],
            displayableValues: [
              { id: 'brightness', label: 'Brightness', icon: '💡', value: '80%', widgetType: 'value' }
            ],
            isGroup: false
          },
          {
            id: 'climate.living_room',
            name: 'Living Room Thermostat',
            deviceType: 'climate' as DeviceType,
            manufacturer: 'Nest',
            model: 'Thermostat',
            primaryEntity: 'climate.living_room',
            entities: [
              {
                entity_id: 'climate.living_room',
                friendly_name: 'Living Room Thermostat',
                state: 'heat',
                domain: 'climate',
                attributes: { current_temperature: 22 },
                capabilities: ['temperature'],
                device_class: null
              }
            ],
            displayableValues: [
              { id: 'temp', label: 'Temperature', icon: '🌡️', value: '22°C', widgetType: 'value' }
            ],
            isGroup: false
          }
        ],
        entityCount: 2
      },
      {
        id: 'bedroom',
        name: 'Bedroom',
        icon: '🛏️',
        devices: [
          {
            id: 'light.bedroom',
            name: 'Bedroom Light',
            deviceType: 'light' as DeviceType,
            manufacturer: 'IKEA',
            model: 'TRADFRI',
            primaryEntity: 'light.bedroom',
            entities: [
              {
                entity_id: 'light.bedroom',
                friendly_name: 'Bedroom Light',
                state: 'off',
                domain: 'light',
                attributes: {},
                capabilities: ['brightness'],
                device_class: null
              }
            ],
            displayableValues: [],
            isGroup: false
          },
          {
            id: 'sensor.bedroom_temp',
            name: 'Bedroom Temperature',
            deviceType: 'sensor' as DeviceType,
            manufacturer: 'Xiaomi',
            model: 'Temp & Humidity Sensor',
            primaryEntity: 'sensor.bedroom_temp',
            entities: [
              {
                entity_id: 'sensor.bedroom_temp',
                friendly_name: 'Bedroom Temperature',
                state: '20.5',
                domain: 'sensor',
                attributes: { unit_of_measurement: '°C' },
                capabilities: [],
                device_class: 'temperature'
              }
            ],
            displayableValues: [
              { id: 'temp', label: 'Temperature', icon: '🌡️', value: '20.5°C', widgetType: 'value' }
            ],
            isGroup: false
          }
        ],
        entityCount: 2
      },
      {
        id: 'kitchen',
        name: 'Kitchen',
        icon: '🍳',
        devices: [
          {
            id: 'light.kitchen',
            name: 'Kitchen Light',
            deviceType: 'light' as DeviceType,
            manufacturer: 'Philips',
            model: 'Hue White & Color',
            primaryEntity: 'light.kitchen',
            entities: [
              {
                entity_id: 'light.kitchen',
                friendly_name: 'Kitchen Light',
                state: 'on',
                domain: 'light',
                attributes: { brightness: 255 },
                capabilities: ['brightness', 'color', 'color_temp'],
                device_class: null
              }
            ],
            displayableValues: [
              { id: 'brightness', label: 'Brightness', icon: '💡', value: '100%', widgetType: 'value' }
            ],
            isGroup: false
          },
          {
            id: 'switch.coffee_maker',
            name: 'Coffee Maker',
            deviceType: 'switch' as DeviceType,
            manufacturer: 'TP-Link',
            model: 'Smart Plug',
            primaryEntity: 'switch.coffee_maker',
            entities: [
              {
                entity_id: 'switch.coffee_maker',
                friendly_name: 'Coffee Maker',
                state: 'off',
                domain: 'switch',
                attributes: {},
                capabilities: [],
                device_class: 'outlet'
              }
            ],
            displayableValues: [],
            isGroup: false
          }
        ],
        entityCount: 2
      }
    ],
    unassignedDevices: [
      {
        id: 'media_player.spotify',
        name: 'Spotify',
        deviceType: 'media_player' as DeviceType,
        manufacturer: 'Spotify',
        model: 'Connect',
        primaryEntity: 'media_player.spotify',
        entities: [
          {
            entity_id: 'media_player.spotify',
            friendly_name: 'Spotify',
            state: 'idle',
            domain: 'media_player',
            attributes: {},
            capabilities: [],
            device_class: null
          }
        ],
        displayableValues: [],
        isGroup: false
      },
      {
        id: 'vacuum.roborock',
        name: 'Roborock Vacuum',
        deviceType: 'vacuum' as DeviceType,
        manufacturer: 'Roborock',
        model: 'S7',
        primaryEntity: 'vacuum.roborock',
        entities: [
          {
            entity_id: 'vacuum.roborock',
            friendly_name: 'Roborock Vacuum',
            state: 'docked',
            domain: 'vacuum',
            attributes: { battery_level: 95 },
            capabilities: [],
            device_class: null
          }
        ],
        displayableValues: [
          { id: 'battery', label: 'Battery', icon: '🔋', value: '95%', widgetType: 'value' }
        ],
        isGroup: false
      }
    ],
    groups: [],
    stats: {
      totalAreas: 3,
      totalDevices: 8,
      totalEntities: 8,
      devicesByType: {
        light: 3,
        climate: 1,
        sensor: 1,
        switch: 1,
        media_player: 1,
        vacuum: 1,
        cover: 0,
        camera: 0,
        lock: 0,
        fan: 0,
        battery: 0,
        tracker: 0,
        unknown: 0
      }
    }
  };
};

interface DeviceDiscoveryContextType {
  discoveryResult: HomeDiscoveryResult | null;
  isDiscovering: boolean;
  lastDiscoveryTime: Date | null;
  error: string | null;
  runDiscovery: () => Promise<void>;
  refreshArea: (areaId: string) => Promise<void>;
  getDevicesByArea: (areaId: string) => DiscoveredDevice[];
  getDevicesByType: (type: DeviceType) => DiscoveredDevice[];
  runAutoAssignment: () => Promise<void>;
}

const DeviceDiscoveryContext = createContext<DeviceDiscoveryContextType | undefined>(undefined);

export const DeviceDiscoveryProvider = ({ children }: { children: ReactNode }) => {
  const [discoveryResult, setDiscoveryResult] = useState<HomeDiscoveryResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [lastDiscoveryTime, setLastDiscoveryTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Import area management dynamically to avoid circular dependency
  const [areaManagement, setAreaManagement] = useState<any>(null);
  
  useEffect(() => {
    import('@/contexts/AreaManagementContext').then(module => {
      setAreaManagement({ useAreaManagement: module.useAreaManagement });
    });
  }, []);

  const runDiscovery = async () => {
    const haConfig = localStorage.getItem('ha_config');
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

  const runAutoAssignment = async () => {
    if (!discoveryResult) {
      toast({
        title: "No devices found",
        description: "Please run discovery first",
        variant: "destructive",
      });
      return;
    }

    // This will be called from components that have access to area management
    toast({
      title: "Auto-assignment initiated",
      description: "Processing device assignments...",
    });
  };

  useEffect(() => {
    const haConfig = localStorage.getItem('ha_config');
    if (haConfig) {
      runDiscovery();
    } else {
      // Load demo data when no HA config
      setDiscoveryResult(getDemoData());
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
        getDevicesByType,
        runAutoAssignment
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
