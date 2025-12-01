import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Zap, Info } from 'lucide-react';
import { DiscoveredDevice } from '@/types/discovery';
import DeviceTypeIcon from './DeviceTypeIcon';
import ManufacturerLogo from './ManufacturerLogo';
import DeviceWidget from './DeviceWidget';
import AreaAssignmentDropdown from './AreaAssignmentDropdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeviceDetailModalProps {
  device: DiscoveredDevice | null;
  isOpen: boolean;
  onClose: () => void;
}

const DeviceDetailModal = ({ device, isOpen, onClose }: DeviceDetailModalProps) => {
  if (!device) return null;

  const primaryEntity = device.entities.find(e => e.entity_id === device.primaryEntity) || device.entities[0];
  const isActive = device.entities.some(e => e.state === 'on' || e.state === 'playing' || e.state === 'home');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[hsl(28,20%,18%)]/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-3 rounded-xl transition-colors ${
              isActive 
                ? 'bg-[hsl(43_88%_60%)]/10' 
                : 'bg-white/5'
            }`}>
              <DeviceTypeIcon 
                type={device.deviceType} 
                state={primaryEntity.state}
                className="w-6 h-6" 
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-light text-white/90" style={{ fontFamily: 'Cormorant Garamond' }}>
                  {device.name}
                </h2>
                {device.manufacturer && (
                  <ManufacturerLogo 
                    manufacturer={device.manufacturer} 
                    className="w-5 h-5 text-white/60"
                  />
                )}
              </div>
              {device.manufacturer && (
                <p className="text-sm font-light text-white/50 mt-0.5">
                  {device.manufacturer}
                </p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Area Assignment */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white/50" strokeWidth={1.5} />
                <span className="text-sm font-light text-white/70">Area Assignment</span>
              </div>
              <AreaAssignmentDropdown 
                deviceId={device.id} 
                deviceName={device.name}
              />
            </div>
          </div>

          {/* Displayable Values */}
          {device.displayableValues && device.displayableValues.length > 0 && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-light text-white/70 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" strokeWidth={1.5} />
                Current Values
              </h3>
              <div className="space-y-2">
                {device.displayableValues.map((widget) => (
                  <DeviceWidget key={widget.id} widget={widget} />
                ))}
              </div>
            </div>
          )}

          {/* All Entities */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="text-sm font-light text-white/70 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" strokeWidth={1.5} />
              All Entities ({device.entities.length})
            </h3>
            <div className="space-y-3">
              {device.entities.map((entity) => (
                <motion.div
                  key={entity.entity_id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono text-white/50 truncate">
                          {entity.entity_id}
                        </code>
                        {entity.entity_id === device.primaryEntity && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(44,85%,58%)]/20 text-[hsl(44,85%,58%)] font-light">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-light text-white/90 mb-1">
                        {entity.friendly_name}
                      </p>
                      {entity.device_class && (
                        <p className="text-xs font-light text-white/50">
                          Device Class: {entity.device_class}
                        </p>
                      )}
                      {entity.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entity.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/60 font-light"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        entity.state === 'on' || entity.state === 'playing' || entity.state === 'home'
                          ? 'text-[hsl(44,85%,58%)]'
                          : 'text-white/50'
                      }`}>
                        {entity.state}
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">{entity.domain}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Group Info */}
          {device.isGroup && device.groupMembers && device.groupMembers.length > 0 && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-light text-white/70 mb-3">
                Group Members ({device.groupMembers.length})
              </h3>
              <div className="space-y-1">
                {device.groupMembers.map((memberId) => (
                  <div
                    key={memberId}
                    className="text-xs font-mono text-white/50 py-1 px-2 rounded bg-white/[0.02]"
                  >
                    {memberId}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceDetailModal;
