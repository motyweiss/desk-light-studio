import { motion } from 'framer-motion';
import { DiscoveredDevice } from '@/types/discovery';
import DeviceCard from './DeviceCard';
import { AlertCircle } from 'lucide-react';

interface UnassignedSectionProps {
  devices: DiscoveredDevice[];
}

const UnassignedSection = ({ devices }: UnassignedSectionProps) => {
  if (devices.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mt-8"
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
        <AlertCircle className="w-5 h-5 text-white/50" strokeWidth={1.5} />
        <h2 className="text-xl font-light text-white/70">
          Unassigned Devices
        </h2>
        <span className="text-sm font-light text-white/40">
          ({devices.length})
        </span>
      </div>

      <div className="space-y-2">
        {devices.map((device, index) => (
          <DeviceCard key={device.id} device={device} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default UnassignedSection;
