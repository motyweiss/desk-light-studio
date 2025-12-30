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

const contentVariants = {
  hidden: { 
    opacity: 0, 
    height: 0,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    height: "auto",
    filter: "blur(0px)",
    transition: {
      height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
      opacity: { duration: 0.3, delay: 0.05 },
      filter: { duration: 0.3, delay: 0.05 }
    }
  },
  exit: { 
    opacity: 0, 
    height: 0,
    filter: "blur(4px)",
    transition: {
      height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
      opacity: { duration: 0.2 },
      filter: { duration: 0.2 }
    }
  }
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
            <span className="text-sm font-light text-white/70">{config.label}</span>
            <span className="text-xs text-white/30 font-light">({devices.length})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddDevice(category)}
            className="h-8 px-3 text-xs text-white/50 hover:text-white hover:bg-white/[0.06] rounded-lg font-light transition-all duration-300"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add
          </Button>
        </div>

        {/* Device Cards Grid */}
        <AnimatePresence mode="popLayout">
          {devices.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="py-4 text-center text-xs text-white/30 font-light bg-white/[0.02] rounded-xl border border-white/[0.04] border-dashed"
            >
              No {config.label.toLowerCase()} configured
            </motion.div>
          ) : (
            <div className="grid gap-2.5">
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
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] as const }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-500"
    >
      {/* Room Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors duration-300"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-base font-light text-white/90 tracking-wide">{room.name}</h3>
          <span className="text-xs text-white/30 font-light bg-white/[0.04] px-2.5 py-1 rounded-lg">
            {totalDevices} device{totalDevices !== 1 ? 's' : ''}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChevronDown className="w-5 h-5 text-white/30" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-6 border-t border-white/[0.04] pt-5">
              {renderDeviceCategory('lights', room.lights, 'light')}
              
              <div className="h-px bg-white/[0.04]" />
              
              {renderDeviceCategory('sensors', room.sensors, 'sensor')}
              
              <div className="h-px bg-white/[0.04]" />
              
              {renderDeviceCategory('mediaPlayers', room.mediaPlayers, 'media_player')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoomSection;
