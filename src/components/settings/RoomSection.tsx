import { Lightbulb, Thermometer, Music } from "lucide-react";
import DeviceCategory from "./DeviceCategory";
import { RoomConfig, DeviceConfig } from "@/types/settings";
import { HAEntity } from "@/services/homeAssistant";

interface RoomSectionProps {
  room: RoomConfig;
  entities: HAEntity[];
  onAddDevice: (category: 'lights' | 'sensors' | 'mediaPlayers') => void;
  onUpdateDevice: (category: 'lights' | 'sensors' | 'mediaPlayers', deviceId: string, updates: Partial<DeviceConfig>) => void;
  onRemoveDevice: (category: 'lights' | 'sensors' | 'mediaPlayers', deviceId: string) => void;
  isLoading?: boolean;
}

const RoomSection = ({
  room,
  entities,
  onAddDevice,
  onUpdateDevice,
  onRemoveDevice,
  isLoading,
}: RoomSectionProps) => {
  return (
    <div className="space-y-6 p-6 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-slab font-normal tracking-tight text-white">{room.name}</h3>
      </div>

      <div className="space-y-6">
        <DeviceCategory
          title="Lights"
          icon={<Lightbulb className="w-4 h-4" />}
          devices={room.lights}
          entities={entities}
          entityType="light"
          onAdd={() => onAddDevice('lights')}
          onUpdate={(deviceId, updates) => onUpdateDevice('lights', deviceId, updates)}
          onRemove={(deviceId) => onRemoveDevice('lights', deviceId)}
          isLoading={isLoading}
        />

        <div className="h-px bg-white/5" />

        <DeviceCategory
          title="Climate Sensors"
          icon={<Thermometer className="w-4 h-4" />}
          devices={room.sensors}
          entities={entities}
          entityType="sensor"
          onAdd={() => onAddDevice('sensors')}
          onUpdate={(deviceId, updates) => onUpdateDevice('sensors', deviceId, updates)}
          onRemove={(deviceId) => onRemoveDevice('sensors', deviceId)}
          isLoading={isLoading}
        />

        <div className="h-px bg-white/5" />

        <DeviceCategory
          title="Media Players"
          icon={<Music className="w-4 h-4" />}
          devices={room.mediaPlayers}
          entities={entities}
          entityType="media_player"
          onAdd={() => onAddDevice('mediaPlayers')}
          onUpdate={(deviceId, updates) => onUpdateDevice('mediaPlayers', deviceId, updates)}
          onRemove={(deviceId) => onRemoveDevice('mediaPlayers', deviceId)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default RoomSection;
