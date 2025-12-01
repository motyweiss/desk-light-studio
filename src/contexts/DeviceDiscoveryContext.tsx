import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeviceDiscoveryService } from '@/services/deviceDiscovery';
import { HomeDiscoveryResult, DiscoveredDevice, DeviceType } from '@/types/discovery';
import { useToast } from '@/hooks/use-toast';
import { useAreaManagement } from '@/contexts/AreaManagementContext';

const getDemoData = (): HomeDiscoveryResult => {
  return {
    areas: [
      {
        id: 'living_room',
        name: 'Living Room',
        icon: '🛋️',
        devices: [
          {
            id: 'light.living_room_all',
            name: 'Living Room All Lights',
            area_id: 'living_room',
            area_name: 'Living Room',
            deviceType: 'light' as DeviceType,
            manufacturer: 'Philips',
            model: 'Hue Group',
            primaryEntity: 'light.living_room_all',
            entities: [
              {
                entity_id: 'light.living_room_all',
                friendly_name: 'Living Room All Lights',
                state: 'on',
                domain: 'light',
                attributes: { brightness: 204, entity_id: ['light.living_room_main', 'light.living_room_corner', 'light.living_room_ceiling'] },
                capabilities: ['brightness', 'color_temp'],
                device_class: undefined
              }
            ],
            displayableValues: [
              { id: 'status', label: 'Status', icon: 'Lightbulb', value: 'On', widgetType: 'status', isActive: true },
              { id: 'brightness', label: 'Brightness', icon: 'Sun', value: 80, unit: '%', widgetType: 'value', isActive: true },
              { id: 'lights', label: 'Lights', icon: 'Target', value: 3, unit: ' lights', widgetType: 'value', isActive: true }
            ],
            isGroup: true,
            groupMembers: ['light.living_room_main', 'light.living_room_corner', 'light.living_room_ceiling']
          },
          {
            id: 'climate.living_room',
            name: 'Living Room Thermostat',
            area_id: 'living_room',
            area_name: 'Living Room',
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
                attributes: { current_temperature: 22, target_temp_high: 24 },
                capabilities: ['temperature'],
                device_class: undefined
              }
            ],
            displayableValues: [
              { id: 'current_temp', label: 'Current', icon: 'Thermometer', value: 22, unit: '°C', widgetType: 'value', isActive: true },
              { id: 'target_temp', label: 'Target', icon: 'Target', value: 24, unit: '°C', widgetType: 'value', isActive: true },
              { id: 'mode', label: 'Mode', icon: 'Flame', value: 'Heat', widgetType: 'status', isActive: true }
            ],
            isGroup: false
          },
          {
            id: 'binary_sensor.living_room_motion',
            name: 'Living Room Motion',
            area_id: 'living_room',
            area_name: 'Living Room',
            deviceType: 'sensor' as DeviceType,
            manufacturer: 'Xiaomi',
            model: 'Motion Sensor',
            primaryEntity: 'binary_sensor.living_room_motion',
            entities: [
              {
                entity_id: 'binary_sensor.living_room_motion',
                friendly_name: 'Living Room Motion',
                state: 'on',
                domain: 'binary_sensor',
                attributes: {},
                capabilities: [],
                device_class: 'motion'
              }
            ],
            displayableValues: [
              { id: 'motion', label: 'Motion', icon: 'Activity', value: 'Detected', widgetType: 'status', isActive: true }
            ],
            isGroup: false
          }
        ],
        entityCount: 3
      },
      {
        id: 'bedroom',
        name: 'Bedroom',
        icon: '🛏️',
        devices: [
          {
            id: 'light.bedroom',
            name: 'Bedroom Light',
            area_id: 'bedroom',
            area_name: 'Bedroom',
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
                device_class: undefined
              }
            ],
            displayableValues: [
              { id: 'status', label: 'Status', icon: 'Lightbulb', value: 'Off', widgetType: 'status', isActive: false }
            ],
            isGroup: false
          },
          {
            id: 'sensor.bedroom_temp',
            name: 'Bedroom Temperature',
            area_id: 'bedroom',
            area_name: 'Bedroom',
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
              { id: 'temp', label: 'Temperature', icon: 'Thermometer', value: 20.5, unit: '°C', widgetType: 'value', isActive: true }
            ],
            isGroup: false
          },
          {
            id: 'sensor.bedroom_humidity',
            name: 'Bedroom Humidity',
            area_id: 'bedroom',
            area_name: 'Bedroom',
            deviceType: 'sensor' as DeviceType,
            manufacturer: 'Xiaomi',
            model: 'Temp & Humidity Sensor',
            primaryEntity: 'sensor.bedroom_humidity',
            entities: [
              {
                entity_id: 'sensor.bedroom_humidity',
                friendly_name: 'Bedroom Humidity',
                state: '65',
                domain: 'sensor',
                attributes: { unit_of_measurement: '%' },
                capabilities: [],
                device_class: 'humidity'
              }
            ],
            displayableValues: [
              { id: 'humidity', label: 'Humidity', icon: 'Droplets', value: 65, unit: '%', widgetType: 'value', isActive: true }
            ],
            isGroup: false
          },
          {
            id: 'binary_sensor.bedroom_door',
            name: 'Bedroom Door',
            area_id: 'bedroom',
            area_name: 'Bedroom',
            deviceType: 'sensor' as DeviceType,
            manufacturer: 'Xiaomi',
            model: 'Door Sensor',
            primaryEntity: 'binary_sensor.bedroom_door',
            entities: [
              {
                entity_id: 'binary_sensor.bedroom_door',
                friendly_name: 'Bedroom Door',
                state: 'off',
                domain: 'binary_sensor',
                attributes: {},
                capabilities: [],
                device_class: 'door'
              }
            ],
            displayableValues: [
              { id: 'door', label: 'Door', icon: 'DoorClosed', value: 'Closed', widgetType: 'status', isActive: false }
            ],
            isGroup: false
          }
        ],
        entityCount: 4
      },
      {
        id: 'kitchen',
        name: 'Kitchen',
        icon: '🍳',
        devices: [
          {
            id: 'light.kitchen',
            name: 'Kitchen Light',
            area_id: 'kitchen',
            area_name: 'Kitchen',
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
                device_class: undefined
              }
            ],
            displayableValues: [
              { id: 'status', label: 'Status', icon: 'Lightbulb', value: 'On', widgetType: 'status', isActive: true },
              { id: 'brightness', label: 'Brightness', icon: 'Sun', value: 100, unit: '%', widgetType: 'value', isActive: true }
            ],
            isGroup: false
          },
          {
            id: 'switch.coffee_maker',
            name: 'Coffee Maker',
            area_id: 'kitchen',
            area_name: 'Kitchen',
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
            displayableValues: [
              { id: 'status', label: 'Status', icon: 'Plug', value: 'Off', widgetType: 'status', isActive: false }
            ],
            isGroup: false
          },
          {
            id: 'sensor.kitchen_illuminance',
            name: 'Kitchen Light Level',
            area_id: 'kitchen',
            area_name: 'Kitchen',
            deviceType: 'sensor' as DeviceType,
            manufacturer: 'Xiaomi',
            model: 'Light Sensor',
            primaryEntity: 'sensor.kitchen_illuminance',
            entities: [
              {
                entity_id: 'sensor.kitchen_illuminance',
                friendly_name: 'Kitchen Light Level',
                state: '450',
                domain: 'sensor',
                attributes: { unit_of_measurement: 'lx' },
                capabilities: [],
                device_class: 'illuminance'
              }
            ],
            displayableValues: [
              { id: 'illuminance', label: 'Illuminance', icon: 'Sun', value: 450, unit: ' lx', widgetType: 'value', isActive: true }
            ],
            isGroup: false
          }
        ],
        entityCount: 3
      },
      {
        id: 'office',
        name: 'Office',
        icon: '💼',
        devices: [
          {
            id: 'sensor.office_battery',
            name: 'Office Sensor Battery',
            area_id: 'office',
            area_name: 'Office',
            deviceType: 'sensor' as DeviceType,
            manufacturer: 'Xiaomi',
            model: 'Sensor',
            primaryEntity: 'sensor.office_battery',
            entities: [
              {
                entity_id: 'sensor.office_battery',
                friendly_name: 'Office Sensor Battery',
                state: '85',
                domain: 'sensor',
                attributes: { unit_of_measurement: '%' },
                capabilities: [],
                device_class: 'battery'
              }
            ],
            displayableValues: [
              { id: 'battery', label: 'Battery', icon: 'BatteryFull', value: 85, unit: '%', widgetType: 'value', isActive: true }
            ],
            isGroup: false
          },
          {
            id: 'binary_sensor.office_occupancy',
            name: 'Office Occupancy',
            area_id: 'office',
            area_name: 'Office',
            deviceType: 'sensor' as DeviceType,
            manufacturer: 'Philips',
            model: 'Hue Motion',
            primaryEntity: 'binary_sensor.office_occupancy',
            entities: [
              {
                entity_id: 'binary_sensor.office_occupancy',
                friendly_name: 'Office Occupancy',
                state: 'on',
                domain: 'binary_sensor',
                attributes: {},
                capabilities: [],
                device_class: 'occupancy'
              }
            ],
            displayableValues: [
              { id: 'occupancy', label: 'Occupancy', icon: 'UserCheck', value: 'Occupied', widgetType: 'status', isActive: true }
            ],
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
            state: 'playing',
            domain: 'media_player',
            attributes: { 
              media_title: 'Bohemian Rhapsody',
              media_artist: 'Queen',
              volume_level: 0.5
            },
            capabilities: [],
            device_class: undefined
          }
        ],
        displayableValues: [
          { id: 'media', label: 'Playing', icon: 'Music', value: 'Bohemian Rhapsody', widgetType: 'status', isActive: true },
          { id: 'volume', label: 'Volume', icon: 'Volume2', value: 50, unit: '%', widgetType: 'value', isActive: true }
        ],
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
            device_class: undefined
          }
        ],
        displayableValues: [
          { id: 'status', label: 'Status', icon: 'Wind', value: 'Docked', widgetType: 'status', isActive: false },
          { id: 'battery', label: 'Battery', icon: 'BatteryFull', value: 95, unit: '%', widgetType: 'value', isActive: true }
        ],
        isGroup: false
      }
    ],
    groups: [],
    stats: {
      totalAreas: 4,
      totalDevices: 14,
      totalEntities: 14,
      devicesByType: {
        light: 3,
        climate: 1,
        sensor: 7,
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
  const { mergeAutoDetectedAreas, assignDevice, getDeviceArea } = useAreaManagement();

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

  // Auto-sync areas and assignments when discovery result changes
  useEffect(() => {
    if (discoveryResult) {
      // Merge areas from discovery into AreaManagement
      const areasFromDiscovery = discoveryResult.areas.map(area => ({
        id: area.id,
        name: area.name
      }));
      mergeAutoDetectedAreas(areasFromDiscovery);
      
      // Auto-assign devices to their discovered areas
      discoveryResult.areas.forEach(area => {
        area.devices.forEach(device => {
          if (!getDeviceArea(device.id) && device.area_id) {
            assignDevice(device.id, device.area_id, false, 100, 'ha_registry');
          }
        });
      });
    }
  }, [discoveryResult]);

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
