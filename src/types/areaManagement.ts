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
}

export interface AreaManagementState {
  areas: ManagedArea[];
  assignments: DeviceAssignment[];
  customDeviceNames: Record<string, string>;
}
