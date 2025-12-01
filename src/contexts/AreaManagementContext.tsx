import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ManagedArea, DeviceAssignment, AreaManagementState } from '@/types/areaManagement';
import { useToast } from '@/hooks/use-toast';

interface AreaManagementContextType {
  areas: ManagedArea[];
  assignments: DeviceAssignment[];
  customDeviceNames: Record<string, string>;
  createArea: (name: string, icon?: string) => ManagedArea;
  renameArea: (areaId: string, newName: string) => void;
  deleteArea: (areaId: string) => void;
  assignDevice: (deviceId: string, areaId: string | null, isManual?: boolean) => void;
  bulkAssignDevices: (deviceIds: string[], areaId: string) => void;
  getDeviceArea: (deviceId: string) => string | null;
  setCustomDeviceName: (deviceId: string, name: string) => void;
  mergeAutoDetectedAreas: (autoAreas: Array<{ id: string; name: string }>) => void;
}

const AreaManagementContext = createContext<AreaManagementContextType | undefined>(undefined);

const STORAGE_KEY = 'area_management_state';

export const AreaManagementProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AreaManagementState>({
    areas: [],
    assignments: [],
    customDeviceNames: {}
  });
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.areas = parsed.areas.map((area: any) => ({
          ...area,
          createdAt: new Date(area.createdAt),
          updatedAt: new Date(area.updatedAt)
        }));
        setState(parsed);
      } catch (error) {
        console.error('Failed to load area management state:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const createArea = (name: string, icon?: string): ManagedArea => {
    // Check for duplicate names
    let finalName = name;
    let counter = 2;
    while (state.areas.some(a => a.name === finalName)) {
      finalName = `${name} ${counter}`;
      counter++;
    }

    const newArea: ManagedArea = {
      id: `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: finalName,
      icon,
      isAutoDetected: false,
      deviceAssignments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setState(prev => ({
      ...prev,
      areas: [...prev.areas, newArea]
    }));

    toast({
      title: "Area Created",
      description: `"${finalName}" has been created`
    });

    return newArea;
  };

  const renameArea = (areaId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      areas: prev.areas.map(area =>
        area.id === areaId
          ? { ...area, name: newName, updatedAt: new Date() }
          : area
      )
    }));

    toast({
      title: "Area Renamed",
      description: `Area renamed to "${newName}"`
    });
  };

  const deleteArea = (areaId: string) => {
    const area = state.areas.find(a => a.id === areaId);
    
    setState(prev => ({
      ...prev,
      areas: prev.areas.filter(a => a.id !== areaId),
      assignments: prev.assignments.map(assignment =>
        assignment.areaId === areaId
          ? { ...assignment, areaId: null }
          : assignment
      )
    }));

    toast({
      title: "Area Deleted",
      description: `"${area?.name}" has been deleted. Devices moved to unassigned.`
    });
  };

  const assignDevice = (deviceId: string, areaId: string | null, isManual: boolean = true) => {
    setState(prev => {
      const existingIndex = prev.assignments.findIndex(a => a.deviceId === deviceId);
      const newAssignment: DeviceAssignment = {
        deviceId,
        areaId,
        isManualOverride: isManual
      };

      let newAssignments;
      if (existingIndex >= 0) {
        newAssignments = [...prev.assignments];
        newAssignments[existingIndex] = newAssignment;
      } else {
        newAssignments = [...prev.assignments, newAssignment];
      }

      return {
        ...prev,
        assignments: newAssignments,
        areas: prev.areas.map(area => ({
          ...area,
          deviceAssignments: area.id === areaId
            ? [...area.deviceAssignments.filter(id => id !== deviceId), deviceId]
            : area.deviceAssignments.filter(id => id !== deviceId)
        }))
      };
    });
  };

  const bulkAssignDevices = (deviceIds: string[], areaId: string) => {
    deviceIds.forEach(deviceId => assignDevice(deviceId, areaId, true));
    
    toast({
      title: "Devices Assigned",
      description: `${deviceIds.length} devices assigned to area`
    });
  };

  const getDeviceArea = (deviceId: string): string | null => {
    const assignment = state.assignments.find(a => a.deviceId === deviceId);
    return assignment?.areaId || null;
  };

  const setCustomDeviceName = (deviceId: string, name: string) => {
    setState(prev => ({
      ...prev,
      customDeviceNames: {
        ...prev.customDeviceNames,
        [deviceId]: name
      }
    }));
  };

  const mergeAutoDetectedAreas = (autoAreas: Array<{ id: string; name: string }>) => {
    setState(prev => {
      const existingAreaIds = new Set(prev.areas.map(a => a.id));
      const newAreas: ManagedArea[] = [];

      autoAreas.forEach(autoArea => {
        if (!existingAreaIds.has(autoArea.id)) {
          newAreas.push({
            id: autoArea.id,
            name: autoArea.name,
            isAutoDetected: true,
            deviceAssignments: [],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });

      return {
        ...prev,
        areas: [...prev.areas, ...newAreas]
      };
    });
  };

  return (
    <AreaManagementContext.Provider
      value={{
        areas: state.areas,
        assignments: state.assignments,
        customDeviceNames: state.customDeviceNames,
        createArea,
        renameArea,
        deleteArea,
        assignDevice,
        bulkAssignDevices,
        getDeviceArea,
        setCustomDeviceName,
        mergeAutoDetectedAreas
      }}
    >
      {children}
    </AreaManagementContext.Provider>
  );
};

export const useAreaManagement = () => {
  const context = useContext(AreaManagementContext);
  if (context === undefined) {
    throw new Error('useAreaManagement must be used within AreaManagementProvider');
  }
  return context;
};
