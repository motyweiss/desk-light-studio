import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DiscoveredArea, DeviceType } from '@/types/discovery';
import DeviceCard from './DeviceCard';
import { X, Lightbulb, Thermometer, Speaker, Activity, Battery, Zap } from 'lucide-react';

interface AreaDetailSheetProps {
  area: DiscoveredArea | null;
  isOpen: boolean;
  onClose: () => void;
  onDeviceClick?: (deviceId: string) => void;
}

const AreaDetailSheet = ({ area, isOpen, onClose, onDeviceClick }: AreaDetailSheetProps) => {
  if (!area) return null;

  // Calculate statistics
  const devicesByType = area.devices.reduce((acc, device) => {
    acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
    return acc;
  }, {} as Record<DeviceType, number>);

  const activeDevices = area.devices.filter(device => 
    device.entities.some(e => e.state === 'on' || e.state === 'playing' || e.state === 'home')
  ).length;

  const getTypeIcon = (type: DeviceType) => {
    switch (type) {
      case 'light': return <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.5} />;
      case 'climate': return <Thermometer className="w-3.5 h-3.5" strokeWidth={1.5} />;
      case 'media_player': return <Speaker className="w-3.5 h-3.5" strokeWidth={1.5} />;
      case 'sensor': return <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />;
      case 'battery': return <Battery className="w-3.5 h-3.5" strokeWidth={1.5} />;
      default: return <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[hsl(28,20%,18%)]/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-light text-white/90" style={{ fontFamily: 'Cormorant Garamond' }}>
              {area.name}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </button>
          </div>
        </DialogHeader>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-2xl font-light text-white/90 mb-1">
              {area.devices.length}
            </div>
            <div className="text-xs font-light text-white/50">Total Devices</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-2xl font-light text-[hsl(44,85%,58%)] mb-1">
              {activeDevices}
            </div>
            <div className="text-xs font-light text-white/50">Active Now</div>
          </div>
        </div>

        {/* Device Type Breakdown */}
        {Object.keys(devicesByType).length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="text-sm font-light text-white/70 mb-3">Device Types</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(devicesByType).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/5"
                >
                  <div className="text-white/60">
                    {getTypeIcon(type as DeviceType)}
                  </div>
                  <span className="text-sm font-light text-white/90 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-medium text-white/50">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Devices List */}
        <div className="mt-6">
          <h3 className="text-sm font-light text-white/70 mb-3">
            All Devices ({area.devices.length})
          </h3>
          <div className="space-y-2">
            {area.devices.map((device, index) => (
              <DeviceCard 
                key={device.id} 
                device={device} 
                index={index}
                onClick={onDeviceClick ? () => onDeviceClick(device.id) : undefined}
                showAreaAssignment={true}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AreaDetailSheet;
