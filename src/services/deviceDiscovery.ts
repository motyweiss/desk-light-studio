import { HomeAssistantConfig } from './homeAssistant';
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

    // Fetch only states - this is the only endpoint we know works
    const statesRes = await fetch(`${baseUrl}/api/states`, { headers });
    
    if (!statesRes.ok) {
      throw new Error(`Failed to fetch states: ${statesRes.statusText}`);
    }
    
    const states: any[] = await statesRes.json();

    // Extract area information from entity attributes
    const areaMap = new Map<string, { id: string; name: string; entities: DiscoveredEntity[] }>();
    
    // Identify groups
    const groups = this.identifyGroups(states);
    const groupMemberIds = this.collectGroupMemberIds(groups);

    // Process all entities
    const devicesByName = new Map<string, DiscoveredEntity[]>();
    const unassignedEntities: DiscoveredEntity[] = [];

    states.forEach(state => {
      // Skip group members to avoid duplication
      if (groupMemberIds.has(state.entity_id)) return;
      // Skip groups themselves
      if (this.isGroupEntity(state)) return;
      // Skip internal/hidden entities
      if (state.entity_id.startsWith('sun.') || 
          state.entity_id.startsWith('zone.') ||
          state.attributes.hidden) return;

      const entity: DiscoveredEntity = {
        entity_id: state.entity_id,
        domain: state.entity_id.split('.')[0],
        state: state.state,
        friendly_name: state.attributes.friendly_name || state.entity_id,
        device_class: state.attributes.device_class,
        attributes: state.attributes,
        capabilities: this.extractCapabilities(state)
      };

      // Extract area from friendly_name (e.g., "Office Light" -> area: "Office")
      const areaName = this.extractAreaFromName(entity.friendly_name, entity.domain);
      
      if (areaName) {
        if (!areaMap.has(areaName)) {
          areaMap.set(areaName, {
            id: areaName.toLowerCase().replace(/\s+/g, '_'),
            name: areaName,
            entities: []
          });
        }
        areaMap.get(areaName)!.entities.push(entity);
      } else {
        unassignedEntities.push(entity);
      }

      // Group by device name (friendly name without domain-specific suffix)
      const deviceName = this.extractDeviceName(entity.friendly_name, entity.domain);
      if (!devicesByName.has(deviceName)) {
        devicesByName.set(deviceName, []);
      }
      devicesByName.get(deviceName)!.push(entity);
    });

    // Create discovered devices from grouped entities
    const discoveredDevices: DiscoveredDevice[] = [];

    devicesByName.forEach((entities, deviceName) => {
      const primaryEntity = entities[0];
      const areaName = this.extractAreaFromName(primaryEntity.friendly_name, primaryEntity.domain);
      
      const device: DiscoveredDevice = {
        id: entities.length === 1 ? primaryEntity.entity_id : `device_${deviceName.toLowerCase().replace(/\s+/g, '_')}`,
        name: deviceName,
        area_id: areaName?.toLowerCase().replace(/\s+/g, '_'),
        area_name: areaName,
        entities,
        primaryEntity: this.selectPrimaryEntity(entities),
        deviceType: this.detectDeviceType(entities),
        isGroup: false,
        groupMembers: []
      };

      discoveredDevices.push(device);
    });

    // Convert groups to devices
    const groupDevices = groups.map(g => this.groupToDevice(g));
    
    // Build area structures
    const discoveredAreas: DiscoveredArea[] = [];
    areaMap.forEach((areaInfo) => {
      // Get devices for this area
      const areaDevices = discoveredDevices.filter(d => d.area_id === areaInfo.id);
      
      if (areaDevices.length > 0) {
        discoveredAreas.push({
          id: areaInfo.id,
          name: areaInfo.name,
          devices: areaDevices,
          entityCount: areaDevices.reduce((sum, d) => sum + d.entities.length, 0)
        });
      }
    });

    // Unassigned devices
    const unassignedDevices = discoveredDevices.filter(d => !d.area_id);

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

  private extractAreaFromName(friendlyName: string, domain: string): string | null {
    // Common patterns: "Office Light", "Kitchen Temperature", "Bedroom Door"
    // Try to extract the area (first word/words before the device type)
    const parts = friendlyName.split(' ');
    if (parts.length >= 2) {
      // Take everything except the last word as potential area
      const potentialArea = parts.slice(0, -1).join(' ');
      // Common device type words to identify
      const deviceWords = ['light', 'lamp', 'temperature', 'humidity', 'sensor', 'switch', 
                          'battery', 'door', 'window', 'motion', 'camera', 'lock', 'player'];
      const lastWord = parts[parts.length - 1].toLowerCase();
      
      if (deviceWords.some(w => lastWord.includes(w)) || domain === 'sensor' || domain === 'binary_sensor') {
        return potentialArea;
      }
    }
    return null;
  }

  private extractDeviceName(friendlyName: string, domain: string): string {
    // Return the full friendly name as device name
    return friendlyName;
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

  private groupToDevice(group: any): DiscoveredDevice {
    const attrs = group.attributes as any;
    const members = attrs?.entity_id || attrs?.group_members || [];

    return {
      id: group.entity_id,
      name: group.attributes.friendly_name || group.entity_id,
      area_id: undefined,
      area_name: undefined,
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
