import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EntitySearchSelect } from "./EntitySearchSelect";
import { DeviceConfig } from "@/types/settings";
import { HAEntity } from "@/services/homeAssistant";

interface DeviceRowProps {
  device: DeviceConfig;
  entities: HAEntity[];
  entityType: 'light' | 'sensor' | 'media_player';
  sensorType?: 'temperature' | 'humidity' | 'air_quality' | 'battery';
  onUpdate: (deviceId: string, updates: Partial<DeviceConfig>) => void;
  onRemove: (deviceId: string) => void;
  isLoading?: boolean;
}

const DeviceRow = ({
  device,
  entities,
  entityType,
  sensorType,
  onUpdate,
  onRemove,
  isLoading,
}: DeviceRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(device.label);

  const handleLabelSave = () => {
    if (editedLabel.trim() && editedLabel !== device.label) {
      onUpdate(device.id, { label: editedLabel.trim() });
    }
    setIsEditing(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLabelSave();
    } else if (e.key === "Escape") {
      setEditedLabel(device.label);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
      <div className="flex-1 min-w-0 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input
              value={editedLabel}
              onChange={(e) => setEditedLabel(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={handleLabelKeyDown}
              className="h-9 bg-white/10 border-white/20 text-white"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-white/90 hover:text-white transition-colors text-left truncate"
            >
              {device.label}
            </button>
          )}
        </div>
        
        <EntitySearchSelect
          value={device.entity_id}
          onValueChange={(value) => onUpdate(device.id, { entity_id: value })}
          entities={entities}
          entityType={entityType}
          sensorType={sensorType}
          placeholder="Select entity..."
          isLoading={isLoading}
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(device.id)}
        className="h-9 w-9 p-0 text-white/50 hover:text-red-400 hover:bg-red-500/10"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default DeviceRow;
