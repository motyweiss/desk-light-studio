import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeviceRow from "./DeviceRow";
import { DeviceConfig } from "@/types/settings";
import { HAEntity } from "@/services/homeAssistant";

interface DeviceCategoryProps {
  title: string;
  icon: React.ReactNode;
  devices: DeviceConfig[];
  entities: HAEntity[];
  entityType: 'light' | 'sensor' | 'media_player';
  sensorType?: 'temperature' | 'humidity' | 'air_quality' | 'battery';
  onAdd: () => void;
  onUpdate: (deviceId: string, updates: Partial<DeviceConfig>) => void;
  onRemove: (deviceId: string) => void;
  isLoading?: boolean;
}

const DeviceCategory = ({
  title,
  icon,
  devices,
  entities,
  entityType,
  sensorType,
  onAdd,
  onUpdate,
  onRemove,
  isLoading,
}: DeviceCategoryProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-white/70">{icon}</div>
          <h4 className="text-sm font-light text-white/90">{title}</h4>
          <span className="text-xs text-white/40">({devices.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className="h-8 px-3 text-xs text-white/70 hover:text-white hover:bg-white/10"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {devices.length === 0 ? (
          <div className="p-4 text-center text-sm text-white/40 border border-dashed border-white/10 rounded-lg">
            No {title.toLowerCase()} configured
          </div>
        ) : (
          devices.map((device) => (
            <DeviceRow
              key={device.id}
              device={device}
              entities={entities}
              entityType={entityType}
              sensorType={sensorType}
              onUpdate={onUpdate}
              onRemove={onRemove}
              isLoading={isLoading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DeviceCategory;
