import { motion } from "framer-motion";
import RoomSection from "./RoomSection";
import { DevicesMapping, DeviceConfig } from "@/types/settings";
import { HAEntity } from "@/services/homeAssistant";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
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
    </motion.div>
  );
};

export default DevicesTab;
