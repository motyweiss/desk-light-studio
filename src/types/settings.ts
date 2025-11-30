export interface DeviceConfig {
  id: string;
  label: string;
  entity_id: string;
  type?: 'temperature' | 'humidity' | 'air_quality' | 'battery';
}

export interface RoomConfig {
  id: string;
  name: string;
  lights: DeviceConfig[];
  sensors: DeviceConfig[];
  mediaPlayers: DeviceConfig[];
}

export interface DevicesMapping {
  rooms: RoomConfig[];
}

// Legacy mapping structure for backward compatibility
export interface LegacyEntityMapping {
  deskLamp: string;
  monitorLight: string;
  spotlight: string;
  temperatureSensor: string;
  humiditySensor: string;
  airQualitySensor: string;
  mediaPlayer: string;
  iphoneBattery?: string;
  airpodsMaxBattery?: string;
}
