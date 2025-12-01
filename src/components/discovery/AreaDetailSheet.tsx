import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DiscoveredArea } from '@/types/discovery';
import DeviceCard from './DeviceCard';
import { X } from 'lucide-react';

interface AreaDetailSheetProps {
  area: DiscoveredArea | null;
  isOpen: boolean;
  onClose: () => void;
}

const AreaDetailSheet = ({ area, isOpen, onClose }: AreaDetailSheetProps) => {
  if (!area) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[hsl(28_20%_18%)] border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-light text-white/90">
              {area.name}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </button>
          </div>
          <div className="text-sm font-light text-white/50">
            {area.devices.length} devices • {area.entityCount} entities
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-2">
          {area.devices.map((device, index) => (
            <DeviceCard key={device.id} device={device} index={index} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AreaDetailSheet;
