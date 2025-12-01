export interface DiscoveredEntity {
  entity_id: string;
  domain: string;
  state: string;
  friendly_name: string;
  device_class?: string;
  attributes: Record<string, any>;
  capabilities: string[];
}

export type DeviceType = 
  | 'light'
  | 'climate'
  | 'sensor'
  | 'media_player'
  | 'switch'
  | 'cover'
  | 'camera'
  | 'vacuum'
  | 'lock'
  | 'fan'
  | 'battery'
  | 'tracker'
  | 'unknown';

export interface DiscoveredDevice {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  area_id?: string;
  area_name?: string;
  entities: DiscoveredEntity[];
  primaryEntity?: string;
  deviceType: DeviceType;
  isGroup: boolean;
  groupMembers?: string[];
}

export interface DiscoveredArea {
  id: string;
  name: string;
  icon?: string;
  devices: DiscoveredDevice[];
  entityCount: number;
}

export interface HomeDiscoveryResult {
  areas: DiscoveredArea[];
  unassignedDevices: DiscoveredDevice[];
  groups: DiscoveredDevice[];
  stats: {
    totalAreas: number;
    totalDevices: number;
    totalEntities: number;
    devicesByType: Record<DeviceType, number>;
  };
}
