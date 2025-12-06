import { motion } from "framer-motion";
import RoomSection from "./RoomSection";
import { EntityAutoDiscovery } from "./EntityAutoDiscovery";
import { DevicesMapping, DeviceConfig } from "@/types/settings";
import { HAEntity } from "@/services/homeAssistant";
import { useHAConnection } from "@/contexts/HAConnectionContext";

interface DiscoveredEntity {
  entity_id: string;
  friendly_name: string;
  state: string;
  device_class?: string;
  unit_of_measurement?: string;
}

interface DevicesTabProps {
  devicesMapping: DevicesMapping;
  entities: HAEntity[];
  onAddDevice: (roomId: string, category: 'lights' | 'sensors' | 'mediaPlayers') => void;
  onUpdateDevice: (roomId: string, category: 'lights' | 'sensors' | 'mediaPlayers', deviceId: string, updates: Partial<DeviceConfig>) => void;
  onRemoveDevice: (roomId: string, category: 'lights' | 'sensors' | 'mediaPlayers', deviceId: string) => void;
  isLoading?: boolean;
}

const DevicesTab = ({
  devicesMapping,
  entities,
  onAddDevice,
  onUpdateDevice,
  onRemoveDevice,
  isLoading,
}: DevicesTabProps) => {
  const { isConnected } = useHAConnection();

  // Get all configured entity IDs
  const configuredEntityIds = devicesMapping.rooms.flatMap(room => [
    ...room.lights.map(l => l.entity_id),
    ...room.sensors.map(s => s.entity_id),
    ...room.mediaPlayers.map(m => m.entity_id),
  ]);

  // Handle adding discovered entity to first room
  const handleAddDiscoveredEntity = (
    entity: DiscoveredEntity, 
    category: 'lights' | 'sensors' | 'mediaPlayers',
    sensorType?: 'temperature' | 'humidity' | 'air_quality' | 'battery'
  ) => {
    const roomId = devicesMapping.rooms[0]?.id || 'office';
    
    // First add a new device slot
    onAddDevice(roomId, category);
    
    // Then update it with the discovered entity data
    // We need to find the newly added device and update it
    setTimeout(() => {
      const room = devicesMapping.rooms.find(r => r.id === roomId);
      if (!room) return;

      const deviceList = room[category];
      const newDevice = deviceList[deviceList.length - 1];
      
      if (newDevice) {
        const updates: Partial<DeviceConfig> = {
          label: entity.friendly_name,
          entity_id: entity.entity_id,
        };
        
        if (sensorType) {
          updates.type = sensorType;
        }

        onUpdateDevice(roomId, category, newDevice.id, updates);
      }
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Auto Discovery Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-light text-white/70">Auto Discovery</h3>
        <EntityAutoDiscovery
          onAddEntity={handleAddDiscoveredEntity}
          configuredEntityIds={configuredEntityIds}
          isConnected={isConnected}
        />
      </div>

      {/* Separator */}
      <div className="h-px bg-white/10" />

      {/* Room Sections */}
      <div className="space-y-6">
        <h3 className="text-sm font-light text-white/70">Configured Devices</h3>
        {devicesMapping.rooms.map((room) => (
          <RoomSection
            key={room.id}
            room={room}
            entities={entities}
            onAddDevice={(category) => onAddDevice(room.id, category)}
            onUpdateDevice={(category, deviceId, updates) =>
              onUpdateDevice(room.id, category, deviceId, updates)
            }
            onRemoveDevice={(category, deviceId) =>
              onRemoveDevice(room.id, category, deviceId)
            }
            isLoading={isLoading}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default DevicesTab;
