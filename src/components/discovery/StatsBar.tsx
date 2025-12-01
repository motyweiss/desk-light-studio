import { motion } from 'framer-motion';
import { Home, Boxes, Layers, Zap } from 'lucide-react';

interface StatsBarProps {
  totalAreas: number;
  totalDevices: number;
  totalEntities: number;
  isConnected: boolean;
}

const StatsBar = ({ totalAreas, totalDevices, totalEntities, isConnected }: StatsBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center gap-8 py-4 px-6 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl"
    >
      <div className="flex items-center gap-2">
        <Home className="w-4 h-4 text-white/60" strokeWidth={1.5} />
        <span className="text-sm font-light text-white/90">
          {totalAreas} Areas
        </span>
      </div>

      <div className="h-4 w-px bg-white/10" />

      <div className="flex items-center gap-2">
        <Boxes className="w-4 h-4 text-white/60" strokeWidth={1.5} />
        <span className="text-sm font-light text-white/90">
          {totalDevices} Devices
        </span>
      </div>

      <div className="h-4 w-px bg-white/10" />

      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-white/60" strokeWidth={1.5} />
        <span className="text-sm font-light text-white/90">
          {totalEntities} Entities
        </span>
      </div>

      <div className="h-4 w-px bg-white/10" />

      <div className="flex items-center gap-2">
        <Zap 
          className={`w-4 h-4 ${isConnected ? 'text-[hsl(43_88%_60%)]' : 'text-white/30'}`} 
          strokeWidth={1.5} 
        />
        <span className={`text-sm font-light ${isConnected ? 'text-[hsl(43_88%_60%)]' : 'text-white/30'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </motion.div>
  );
};

export default StatsBar;
