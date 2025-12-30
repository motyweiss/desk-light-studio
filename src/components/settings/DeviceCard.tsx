import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Pencil, Check, X, Lightbulb, Thermometer, Droplets, Wind, Battery, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EntitySearchSelect } from "./EntitySearchSelect";
import { DeviceConfig } from "@/types/settings";
import { HAEntity } from "@/services/homeAssistant";

interface DeviceCardProps {
  device: DeviceConfig;
  entities: HAEntity[];
  entityType: 'light' | 'sensor' | 'media_player';
  category: 'lights' | 'sensors' | 'mediaPlayers';
  onUpdate: (updates: Partial<DeviceConfig>) => void;
  onRemove: () => void;
  isLoading?: boolean;
  index?: number;
}

const getDeviceIcon = (category: string, sensorType?: string) => {
  if (category === 'lights') return Lightbulb;
  if (category === 'mediaPlayers') return Music;
  if (category === 'sensors') {
    switch (sensorType) {
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'air_quality': return Wind;
      case 'battery': return Battery;
      default: return Thermometer;
    }
  }
  return Lightbulb;
};

const getIconColor = (category: string) => {
  switch (category) {
    case 'lights': return 'text-amber-400';
    case 'sensors': return 'text-blue-400';
    case 'mediaPlayers': return 'text-purple-400';
    default: return 'text-foreground/60';
  }
};

const getIconBgColor = (category: string) => {
  switch (category) {
    case 'lights': return 'bg-amber-400/10';
    case 'sensors': return 'bg-blue-400/10';
    case 'mediaPlayers': return 'bg-purple-400/10';
    default: return 'bg-secondary/50';
  }
};

const DeviceCard = ({
  device,
  entities,
  entityType,
  category,
  onUpdate,
  onRemove,
  isLoading,
  index = 0,
}: DeviceCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(device.label);
  const [isHovered, setIsHovered] = useState(false);

  const Icon = getDeviceIcon(category, device.type);
  const iconColor = getIconColor(category);
  const iconBgColor = getIconBgColor(category);

  const handleLabelSave = () => {
    if (editedLabel.trim() && editedLabel !== device.label) {
      onUpdate({ label: editedLabel.trim() });
    }
    setIsEditing(false);
  };

  const handleLabelCancel = () => {
    setEditedLabel(device.label);
    setIsEditing(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLabelSave();
    } else if (e.key === "Escape") {
      handleLabelCancel();
    }
  };

  const getSensorType = (): 'temperature' | 'humidity' | 'air_quality' | 'battery' | undefined => {
    if (category === 'sensors' && device.type) {
      return device.type as 'temperature' | 'humidity' | 'air_quality' | 'battery';
    }
    return undefined;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.03, ease: [0.22, 0.03, 0.26, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-4 rounded-2xl bg-secondary/40 border border-border/30 hover:border-border/50 hover:bg-secondary/50 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Device Icon */}
        <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Label Row */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedLabel}
                  onChange={(e) => setEditedLabel(e.target.value)}
                  onBlur={handleLabelSave}
                  onKeyDown={handleLabelKeyDown}
                  className="h-8 bg-secondary/60 border-border/50 text-foreground text-sm"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLabelSave}
                  className="h-8 w-8 p-0 text-status-optimal hover:bg-status-optimal/10"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLabelCancel}
                  className="h-8 w-8 p-0 text-foreground/50 hover:bg-secondary/50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="group/label flex items-center gap-2 text-sm font-medium text-foreground/90 hover:text-foreground transition-colors text-left"
              >
                <span className="truncate">{device.label}</span>
                <Pencil className="w-3 h-3 text-foreground/30 group-hover/label:text-foreground/50 transition-colors" />
              </button>
            )}
          </div>

          {/* Entity Select */}
          <EntitySearchSelect
            value={device.entity_id}
            onValueChange={(value) => onUpdate({ entity_id: value })}
            entities={entities}
            entityType={entityType}
            sensorType={getSensorType()}
            placeholder="Select entity..."
            isLoading={isLoading}
          />
        </div>

        {/* Delete Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-9 w-9 p-0 text-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Entity ID Badge */}
      {device.entity_id && (
        <div className="mt-3 pl-14">
          <span className="inline-block text-[11px] font-mono text-muted-foreground/50 bg-secondary/30 px-2 py-0.5 rounded-md truncate max-w-full">
            {device.entity_id}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default DeviceCard;
