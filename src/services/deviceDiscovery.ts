import { HAEntity, HomeAssistantConfig } from './homeAssistant';
import { 
  DiscoveredDevice, 
  DiscoveredArea, 
  DiscoveredEntity, 
  DeviceType, 
  HomeDiscoveryResult 
} from '@/types/discovery';

const DOMAIN_PRIORITY = [
  'light',
  'climate',
  'media_player',
  'cover',
  'switch',
  'fan',
  'vacuum',
  'lock',
  'camera',
  'sensor',
  'binary_sensor'
];

export class DeviceDiscoveryService {
  private config: HomeAssistantConfig;

  constructor(config: HomeAssistantConfig) {
    this.config = config;
  }

  async discoverHome(): Promise<HomeDiscoveryResult> {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const headers = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
    };

    // Fetch all data in parallel
    const [statesRes, areasRes, devicesRes, entitiesRes] = await Promise.all([
      fetch(`${baseUrl}/api/states`, { headers }),
      fetch(`${baseUrl}/api/config/area_registry/list`, { headers, method: 'POST' }),
      fetch(`${baseUrl}/api/config/device_registry/list`, { headers, method: 'POST' }),
      fetch(`${baseUrl}/api/config/entity_registry/list`, { headers, method: 'POST' })
    ]);

    const states: any[] = await statesRes.json();
    const areas: any[] = await areasRes.json();
    const devices: any[] = await devicesRes.json();
    const entityRegistry: any[] = await entitiesRes.json();

    // Build maps for quick lookup
    const areaMap = new Map<string, any>(areas.map((a: any) => [a.area_id, a]));
    const deviceMap = new Map<string, any>(devices.map((d: any) => [d.id, d]));
    const entityToDeviceMap = new Map<string, any>(
      entityRegistry.map((e: any) => [e.entity_id, { device_id: e.device_id, area_id: e.area_id }])
    );

    // Identify groups
    const groups = this.identifyGroups(states);
    const groupMemberIds = this.collectGroupMemberIds(groups);

    // Group entities by device (excluding group members)
    const deviceEntitiesMap = new Map<string, DiscoveredEntity[]>();
    const entitiesWithoutDevice: DiscoveredEntity[] = [];

    states.forEach(state => {
      if (groupMemberIds.has(state.entity_id)) return;
      if (this.isGroupEntity(state)) return;

      const entity: DiscoveredEntity = {
        entity_id: state.entity_id,
        domain: state.entity_id.split('.')[0],
        state: state.state,
        friendly_name: state.attributes.friendly_name || state.entity_id,
        device_class: state.attributes.device_class,
        attributes: state.attributes,
        capabilities: this.extractCapabilities(state)
      };

      const registryInfo = entityToDeviceMap.get(state.entity_id);
      const deviceId = registryInfo?.device_id || 'no-device';

      if (deviceId === 'no-device') {
        entitiesWithoutDevice.push(entity);
      } else {
        if (!deviceEntitiesMap.has(deviceId)) {
          deviceEntitiesMap.set(deviceId, []);
        }
        deviceEntitiesMap.get(deviceId)!.push(entity);
      }
    });

    // Create discovered devices
    const discoveredDevices: DiscoveredDevice[] = [];

    deviceEntitiesMap.forEach((entities, deviceId) => {
      const deviceInfo = deviceMap.get(deviceId);
      const registryInfo = entityToDeviceMap.get(entities[0].entity_id);
      const areaId = deviceInfo?.area_id || registryInfo?.area_id;
      const area = areaId ? areaMap.get(areaId) : null;

      const device: DiscoveredDevice = {
        id: deviceId,
        name: deviceInfo?.name_by_user || deviceInfo?.name || entities[0].friendly_name,
        manufacturer: deviceInfo?.manufacturer,
        model: deviceInfo?.model,
        area_id: areaId,
        area_name: area?.name,
        entities,
        primaryEntity: this.selectPrimaryEntity(entities),
        deviceType: this.detectDeviceType(entities),
        isGroup: false,
        groupMembers: []
      };

      discoveredDevices.push(device);
    });

    // Handle entities without device
    entitiesWithoutDevice.forEach(entity => {
      const registryInfo = entityToDeviceMap.get(entity.entity_id);
      const areaId = registryInfo?.area_id;
      const area = areaId ? areaMap.get(areaId) : null;

      discoveredDevices.push({
        id: entity.entity_id,
        name: entity.friendly_name,
        area_id: areaId,
        area_name: area?.name,
        entities: [entity],
        primaryEntity: entity.entity_id,
        deviceType: this.detectDeviceType([entity]),
        isGroup: false,
        groupMembers: []
      });
    });

    // Convert groups to devices
    const groupDevices = groups.map(g => this.groupToDevice(g, areaMap, deviceMap, entityToDeviceMap));

    // Group devices by area
    const areaDevicesMap = new Map<string, DiscoveredDevice[]>();
    const unassignedDevices: DiscoveredDevice[] = [];

    [...discoveredDevices, ...groupDevices].forEach(device => {
      if (device.area_id) {
        if (!areaDevicesMap.has(device.area_id)) {
          areaDevicesMap.set(device.area_id, []);
        }
        areaDevicesMap.get(device.area_id)!.push(device);
      } else {
        unassignedDevices.push(device);
      }
    });

    const discoveredAreas: DiscoveredArea[] = Array.from(areaDevicesMap.entries()).map(([areaId, devices]) => {
      const area = areaMap.get(areaId);
      return {
        id: areaId,
        name: area?.name || 'Unknown Area',
        icon: area?.icon,
        devices,
        entityCount: devices.reduce((sum, d) => sum + d.entities.length, 0)
      };
    });

    // Calculate stats
    const allDevices = [...discoveredDevices, ...groupDevices];
    const devicesByType: Record<DeviceType, number> = {} as any;
    allDevices.forEach(d => {
      devicesByType[d.deviceType] = (devicesByType[d.deviceType] || 0) + 1;
    });

    return {
      areas: discoveredAreas.sort((a, b) => a.name.localeCompare(b.name)),
      unassignedDevices,
      groups: groupDevices,
      stats: {
        totalAreas: discoveredAreas.length,
        totalDevices: allDevices.length,
        totalEntities: allDevices.reduce((sum, d) => sum + d.entities.length, 0),
        devicesByType
      }
    };
  }

  private isGroupEntity(state: any): boolean {
    return (
      state.entity_id.startsWith('group.') ||
      Array.isArray((state.attributes as any)?.entity_id) ||
      Array.isArray((state.attributes as any)?.group_members)
    );
  }

  private identifyGroups(states: any[]): any[] {
    return states.filter(s => this.isGroupEntity(s));
  }

  private collectGroupMemberIds(groups: any[]): Set<string> {
    const ids = new Set<string>();
    groups.forEach(g => {
      ((g.attributes as any)?.entity_id || []).forEach((id: string) => ids.add(id));
      ((g.attributes as any)?.group_members || []).forEach((id: string) => ids.add(id));
    });
    return ids;
  }

  private extractCapabilities(state: any): string[] {
    const caps: string[] = [];
    const attrs = state.attributes as any;
    if (attrs?.brightness !== undefined) caps.push('brightness');
    if (attrs?.color_temp !== undefined) caps.push('color_temp');
    if (attrs?.rgb_color !== undefined) caps.push('rgb_color');
    if (attrs?.effect !== undefined) caps.push('effect');
    if (attrs?.volume_level !== undefined) caps.push('volume');
    if (attrs?.media_position !== undefined) caps.push('media_position');
    return caps;
  }

  private selectPrimaryEntity(entities: DiscoveredEntity[]): string {
    const sorted = [...entities].sort((a, b) => {
      const aPriority = DOMAIN_PRIORITY.indexOf(a.domain);
      const bPriority = DOMAIN_PRIORITY.indexOf(b.domain);
      return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority);
    });
    return sorted[0].entity_id;
  }

  private detectDeviceType(entities: DiscoveredEntity[]): DeviceType {
    const domains = entities.map(e => e.domain);
    const deviceClasses = entities.map(e => e.device_class).filter(Boolean);

    if (domains.includes('light')) return 'light';
    if (domains.includes('climate')) return 'climate';
    if (domains.includes('media_player')) return 'media_player';
    if (domains.includes('cover')) return 'cover';
    if (domains.includes('camera')) return 'camera';
    if (domains.includes('vacuum')) return 'vacuum';
    if (domains.includes('lock')) return 'lock';
    if (domains.includes('fan')) return 'fan';
    
    if (domains.includes('sensor')) {
      if (deviceClasses.includes('battery')) return 'battery';
      return 'sensor';
    }
    
    if (domains.includes('device_tracker')) return 'tracker';
    if (domains.includes('switch')) return 'switch';
    
    return 'unknown';
  }

  private groupToDevice(
    group: any, 
    areaMap: Map<string, any>,
    deviceMap: Map<string, any>,
    entityToDeviceMap: Map<string, any>
  ): DiscoveredDevice {
    const attrs = group.attributes as any;
    const members = attrs?.entity_id || attrs?.group_members || [];
    const registryInfo = entityToDeviceMap.get(group.entity_id);
    const areaId = registryInfo?.area_id;
    const area = areaId ? areaMap.get(areaId) : null;

    return {
      id: group.entity_id,
      name: group.attributes.friendly_name || group.entity_id,
      area_id: areaId,
      area_name: area?.name,
      entities: [{
        entity_id: group.entity_id,
        domain: group.entity_id.split('.')[0],
        state: group.state,
        friendly_name: group.attributes.friendly_name || group.entity_id,
        attributes: group.attributes,
        capabilities: []
      }],
      primaryEntity: group.entity_id,
      deviceType: group.entity_id.split('.')[0] as DeviceType,
      isGroup: true,
      groupMembers: members
    };
  }
}
