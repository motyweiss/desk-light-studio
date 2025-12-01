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

    // Process all entities and group intelligently
    const allEntities: DiscoveredEntity[] = [];

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

      allEntities.push(entity);
    });

    // Smart device grouping - group entities by common device name
    const devicesByName = this.smartDeviceGrouping(allEntities);
    
    // Extract area information for each device
    devicesByName.forEach((entities, deviceName) => {
      const areaName = this.extractAreaFromName(entities[0].friendly_name, entities[0].domain);
      
      if (areaName && !areaMap.has(areaName)) {
        areaMap.set(areaName, {
          id: areaName.toLowerCase().replace(/\s+/g, '_'),
          name: areaName,
          entities: []
        });
      }
    });

    // Create discovered devices from grouped entities
    const discoveredDevices: DiscoveredDevice[] = [];

    devicesByName.forEach((entities, deviceKey) => {
      const primaryEntity = entities[0];
      const areaName = this.extractAreaFromName(primaryEntity.friendly_name, primaryEntity.domain);
      
      // Determine device name and manufacturer
      const { name, manufacturer } = this.extractDeviceInfo(deviceKey, entities);
      
      const device: DiscoveredDevice = {
        id: entities.length === 1 ? primaryEntity.entity_id : `device_${deviceKey.toLowerCase().replace(/\s+/g, '_').replace(/'/g, '')}`,
        name,
        manufacturer,
        area_id: areaName?.toLowerCase().replace(/\s+/g, '_'),
        area_name: areaName,
        entities: entities.sort((a, b) => {
          // Sort entities by importance: primary domain first, then sensors
          const aPriority = DOMAIN_PRIORITY.indexOf(a.domain);
          const bPriority = DOMAIN_PRIORITY.indexOf(b.domain);
          return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority);
        }),
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

  private smartDeviceGrouping(entities: DiscoveredEntity[]): Map<string, DiscoveredEntity[]> {
    const deviceGroups = new Map<string, DiscoveredEntity[]>();
    
    entities.forEach(entity => {
      const deviceKey = this.extractDeviceKey(entity);
      
      if (!deviceGroups.has(deviceKey)) {
        deviceGroups.set(deviceKey, []);
      }
      deviceGroups.get(deviceKey)!.push(entity);
    });
    
    return deviceGroups;
  }

  private extractDeviceKey(entity: DiscoveredEntity): string {
    const name = entity.friendly_name;
    
    // Pattern 1: "Device Name Property" (e.g., "Dyson Pure Temperature", "Dyson Pure Humidity")
    // Extract common prefix before the last 1-2 words
    const words = name.split(' ');
    
    if (words.length >= 3) {
      // Check if last word is a property (Temperature, Humidity, Battery, etc.)
      const lastWord = words[words.length - 1].toLowerCase();
      const propertyWords = ['temperature', 'humidity', 'battery', 'level', 'state', 
                            'motion', 'contact', 'status', 'pm'];
      
      if (propertyWords.includes(lastWord) || lastWord.includes('pm')) {
        // Return everything except the last word as device key
        return words.slice(0, -1).join(' ');
      }
      
      // Check for two-word properties (e.g., "Battery Level", "Battery State")
      if (words.length >= 4) {
        const lastTwoWords = words.slice(-2).join(' ').toLowerCase();
        const twoWordProperties = ['battery level', 'battery state', 'pm 2', 'pm 10'];
        
        if (twoWordProperties.some(prop => lastTwoWords.includes(prop))) {
          return words.slice(0, -2).join(' ');
        }
      }
    }
    
    // Pattern 2: "Owner's Device" (e.g., "Moty's iPhone")
    // Keep as-is - this is already a device name
    if (name.includes("'s ") || name.includes("'s")) {
      return name.split(' Battery')[0].split(' Level')[0].split(' State')[0];
    }
    
    // Default: return the full name
    return name;
  }

  private extractAreaFromName(friendlyName: string, domain: string): string | null {
    // Try to detect area from name patterns
    const words = friendlyName.split(' ');
    
    // Skip device names that include ownership (e.g., "Moty's iPhone")
    if (friendlyName.includes("'s ")) return null;
    
    // Common room names
    const commonRooms = ['office', 'bedroom', 'kitchen', 'living', 'bathroom', 
                        'dining', 'garage', 'hall', 'entrance', 'outdoor'];
    
    // Check if any word matches a room name
    for (const word of words) {
      if (commonRooms.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    }
    
    return null;
  }

  private extractDeviceInfo(deviceKey: string, entities: DiscoveredEntity[]): { name: string; manufacturer?: string } {
    // Detect manufacturer from device key
    const lowerKey = deviceKey.toLowerCase();
    
    const manufacturers = [
      { name: 'Dyson', keywords: ['dyson'] },
      { name: 'Philips Hue', keywords: ['hue'] },
      { name: 'Apple', keywords: ['iphone', 'ipad', 'airpods', 'macbook'] },
      { name: 'Sonos', keywords: ['sonos'] },
      { name: 'Spotify', keywords: ['spotify'] }
    ];
    
    for (const mfr of manufacturers) {
      if (mfr.keywords.some(kw => lowerKey.includes(kw))) {
        return {
          name: deviceKey,
          manufacturer: mfr.name
        };
      }
    }
    
    return { name: deviceKey };
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
