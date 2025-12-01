import { motion } from 'framer-motion';
import { DiscoveredArea, DeviceType } from '@/types/discovery';
import DeviceTypeIcon from './DeviceTypeIcon';

interface AreaCardProps {
  area: DiscoveredArea;
  index: number;
  onClick: () => void;
}

const AreaCard = ({ area, index, onClick }: AreaCardProps) => {
  const devicesByType = area.devices.reduce((acc, device) => {
    acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
    return acc;
  }, {} as Record<DeviceType, number>);

  const topTypes = Object.entries(devicesByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className="w-full p-6 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 text-left group"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-light text-white/90 group-hover:text-white transition-colors">
          {area.name}
        </h3>
        <div className="text-xs font-light text-white/50">
          {area.devices.length} devices
        </div>
      </div>

      <div className="space-y-2">
        {topTypes.map(([type, count]) => (
          <div key={type} className="flex items-center gap-3">
            <DeviceTypeIcon type={type as DeviceType} className="w-4 h-4" />
            <span className="text-sm font-light text-white/70">
              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </span>
            <span className="ml-auto text-sm font-light text-white/50">
              ×{count}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="text-xs font-light text-white/40">
          {area.entityCount} total entities
        </div>
      </div>
    </motion.button>
  );
};

export default AreaCard;
