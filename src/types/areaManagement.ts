export interface ManagedArea {
  id: string;
  name: string;
  icon?: string;
  isAutoDetected: boolean;
  deviceAssignments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceAssignment {
  deviceId: string;
  areaId: string | null;
  isManualOverride: boolean;
  confidence?: number;
  source?: 'ha_registry' | 'entity_id' | 'friendly_name' | 'learned' | 'device_group' | 'unknown';
  reasoning?: string;
}

export interface AreaManagementState {
  areas: ManagedArea[];
  assignments: DeviceAssignment[];
  customDeviceNames: Record<string, string>;
  learnedPatterns: Array<{
    pattern: string;
    areaId: string;
    areaName: string;
    matchCount: number;
  }>;
}
