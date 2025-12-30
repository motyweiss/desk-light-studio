import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Thermometer, Music, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeviceCard from "./DeviceCard";
import { RoomConfig, DeviceConfig } from "@/types/settings";
import { HAEntity } from "@/services/homeAssistant";

interface RoomSectionProps {
  room: RoomConfig;
  entities: HAEntity[];
  onAddDevice: (category: 'lights' | 'sensors' | 'mediaPlayers') => void;
  onUpdateDevice: (category: 'lights' | 'sensors' | 'mediaPlayers', deviceId: string, updates: Partial<DeviceConfig>) => void;
  onRemoveDevice: (category: 'lights' | 'sensors' | 'mediaPlayers', deviceId: string) => void;
  isLoading?: boolean;
  index?: number;
}

const categoryConfig = {
  lights: { 
    icon: Lightbulb, 
    label: 'Lights',
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-400/10'
  },
  sensors: { 
    icon: Thermometer, 
    label: 'Climate Sensors',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-400/10'
  },
  mediaPlayers: { 
    icon: Music, 
    label: 'Media Players',
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-400/10'
  },
};

const RoomSection = ({
  room,
  entities,
  onAddDevice,
  onUpdateDevice,
  onRemoveDevice,
  isLoading,
  index = 0,
}: RoomSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const totalDevices = room.lights.length + room.sensors.length + room.mediaPlayers.length;

  const renderDeviceCategory = (
    category: 'lights' | 'sensors' | 'mediaPlayers',
    devices: DeviceConfig[],
    entityType: 'light' | 'sensor' | 'media_player'
  ) => {
    const config = categoryConfig[category];
    const Icon = config.icon;

    return (
      <div className="space-y-3">
        {/* Category Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg ${config.bgColor} flex items-center justify-center`}>
              <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} strokeWidth={1.5} />
            </div>
            <span className="text-sm font-light text-foreground/80">{config.label}</span>
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-md bg-secondary/50">
              {devices.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddDevice(category)}
            className="h-7 px-2.5 text-xs text-foreground/50 hover:text-foreground hover:bg-secondary/50 gap-1.5"
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>

        {/* Device Cards Grid */}
        <AnimatePresence mode="popLayout">
          {devices.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-6 text-center text-sm text-muted-foreground/60 border border-dashed border-border/30 rounded-2xl bg-secondary/20"
            >
              No {config.label.toLowerCase()} configured
            </motion.div>
          ) : (
            <div className="grid gap-3">
              {devices.map((device, deviceIndex) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  entities={entities}
                  entityType={entityType}
                  category={category}
                  onUpdate={(updates) => onUpdateDevice(category, device.id, updates)}
                  onRemove={() => onRemoveDevice(category, device.id)}
                  isLoading={isLoading}
                  index={deviceIndex}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 0.03, 0.26, 1] }}
      className="rounded-2xl bg-secondary/30 border border-border/30 overflow-hidden"
    >
      {/* Room Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-base font-medium text-foreground tracking-tight">{room.name}</h3>
          <span className="text-xs text-muted-foreground">
            {totalDevices} device{totalDevices !== 1 ? 's' : ''}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-foreground/40" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-6">
              {/* Separator */}
              <div className="h-px bg-border/30" />

              {/* Lights */}
              {renderDeviceCategory('lights', room.lights, 'light')}

              {/* Divider */}
              <div className="h-px bg-border/20" />

              {/* Climate Sensors */}
              {renderDeviceCategory('sensors', room.sensors, 'sensor')}

              {/* Divider */}
              <div className="h-px bg-border/20" />

              {/* Media Players */}
              {renderDeviceCategory('mediaPlayers', room.mediaPlayers, 'media_player')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoomSection;
