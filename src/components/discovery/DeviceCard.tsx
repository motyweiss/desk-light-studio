import { motion } from 'framer-motion';
import { DiscoveredDevice } from '@/types/discovery';
import DeviceTypeIcon from './DeviceTypeIcon';
import { Power, Volume2, Thermometer } from 'lucide-react';

interface DeviceCardProps {
  device: DiscoveredDevice;
  index: number;
}

const DeviceCard = ({ device, index }: DeviceCardProps) => {
  const primaryEntity = device.entities.find(e => e.entity_id === device.primaryEntity) || device.entities[0];
  const state = primaryEntity.state;
  const isActive = state === 'on' || state === 'playing' || state === 'home';

  const getStateDisplay = () => {
    if (device.deviceType === 'sensor') {
      const unit = primaryEntity.attributes.unit_of_measurement || '';
      return `${state} ${unit}`.trim();
    }
    if (device.deviceType === 'battery') {
      return `${state}%`;
    }
    if (device.deviceType === 'media_player') {
      return state === 'playing' ? 'Playing' : state.charAt(0).toUpperCase() + state.slice(1);
    }
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="flex items-center gap-4 p-4 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
    >
      <div className={`p-2 rounded-lg ${isActive ? 'bg-[hsl(43_88%_60%)]/10' : 'bg-white/5'}`}>
        <DeviceTypeIcon 
          type={device.deviceType} 
          state={state}
          className="w-5 h-5" 
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-light text-white/90 truncate">
          {device.name}
        </div>
        <div className="text-xs font-light text-white/50 truncate">
          {getStateDisplay()}
        </div>
      </div>

      {device.isGroup && (
        <div className="text-xs font-light text-white/40 px-2 py-1 bg-white/5 rounded">
          Group
        </div>
      )}

      {device.manufacturer && (
        <div className="text-xs font-light text-white/30 hidden md:block">
          {device.manufacturer}
        </div>
      )}
    </motion.div>
  );
};

export default DeviceCard;
