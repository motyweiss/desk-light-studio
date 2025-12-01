import { motion } from 'framer-motion';
import { DiscoveredDevice } from '@/types/discovery';
import DeviceTypeIcon from './DeviceTypeIcon';
import ManufacturerLogo from './ManufacturerLogo';
import DeviceWidget from './DeviceWidget';
import AreaAssignmentDropdown from './AreaAssignmentDropdown';
import { ChevronRight } from 'lucide-react';

interface DeviceCardProps {
  device: DiscoveredDevice;
  index: number;
  onClick?: () => void;
  showAreaAssignment?: boolean;
}

const DeviceCard = ({ device, index, onClick, showAreaAssignment = false }: DeviceCardProps) => {
  const primaryEntity = device.entities.find(e => e.entity_id === device.primaryEntity) || device.entities[0];
  const isActive = device.entities.some(e => e.state === 'on' || e.state === 'playing' || e.state === 'home');

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="w-full p-4 bg-white/[0.02] backdrop-blur-xl border border-white/5 
                 rounded-xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Content */}
          <div 
            className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={onClick}
          >
            {/* Device Icon */}
            <div className={`flex-shrink-0 p-2.5 rounded-lg transition-colors ${
              isActive 
                ? 'bg-[hsl(43_88%_60%)]/10' 
                : 'bg-white/5'
            }`}>
              <DeviceTypeIcon 
                type={device.deviceType}
                deviceClass={primaryEntity.device_class}
                state={primaryEntity.state}
                className="w-5 h-5" 
              />
            </div>
            
            {/* Device Info */}
            <div className="flex-1 min-w-0">
              {/* Device Name + Logo */}
              <div className="flex items-center gap-2.5 mb-0.5">
                <h3 className="font-light text-sm text-white/90 truncate">
                  {device.name}
                </h3>
                {device.manufacturer && (
                  <ManufacturerLogo 
                    manufacturer={device.manufacturer} 
                    className="w-4 h-4 text-white/60"
                  />
                )}
              </div>
              
              {/* Manufacturer */}
              {device.manufacturer && (
                <p className="text-[11px] font-light text-white/40 mb-2.5">
                  {device.manufacturer}
                </p>
              )}

              {/* Display Widgets - Only relevant displayable values */}
              {device.displayableValues && device.displayableValues.length > 0 && (
                <div className="space-y-1.5 mt-2.5">
                  {device.displayableValues.map((widget) => (
                    <DeviceWidget key={widget.id} widget={widget} />
                  ))}
                </div>
              )}

              {/* Fallback: Show entity count if no displayable values */}
              {(!device.displayableValues || device.displayableValues.length === 0) && (
                <div className="text-xs font-light text-white/50 mt-1">
                  {device.entities.length} {device.entities.length === 1 ? 'entity' : 'entities'}
                </div>
              )}
            </div>
          </div>

          {/* Right: Expand Arrow */}
          {onClick && !showAreaAssignment && (
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 
                                    transition-colors flex-shrink-0 mt-1" />
          )}
        </div>

        {/* Area Assignment Dropdown */}
        {showAreaAssignment && (
          <div className="flex justify-end">
            <AreaAssignmentDropdown 
              deviceId={device.id} 
              deviceName={device.name}
            />
          </div>
        )}
      </div>

      {/* Group Badge */}
      {device.isGroup && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <span className="text-[10px] font-light text-white/30 px-2 py-1 bg-white/5 rounded">
            Group • {device.groupMembers?.length || 0} members
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default DeviceCard;
