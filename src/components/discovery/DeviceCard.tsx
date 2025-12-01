import { motion } from 'framer-motion';
import { DiscoveredDevice } from '@/types/discovery';
import DeviceTypeIcon from './DeviceTypeIcon';
import ManufacturerLogo from './ManufacturerLogo';
import { ChevronRight, Zap, Thermometer, Droplets, Wind, Battery, Signal, Activity } from 'lucide-react';

interface DeviceCardProps {
  device: DiscoveredDevice;
  index: number;
  onClick?: () => void;
}

const getEntityIcon = (entity: any) => {
  const domain = entity.domain;
  const deviceClass = entity.device_class;
  
  if (domain === 'sensor') {
    if (deviceClass === 'temperature') return Thermometer;
    if (deviceClass === 'humidity') return Droplets;
    if (deviceClass === 'battery') return Battery;
    if (deviceClass === 'pm25' || deviceClass === 'pm10') return Wind;
    return Activity;
  }
  
  if (domain === 'light') return Zap;
  if (domain === 'binary_sensor') return Signal;
  
  return Activity;
};

const formatEntityValue = (entity: any): string => {
  const { state, attributes } = entity;
  
  if (entity.domain === 'light') {
    return state === 'on' ? 'On' : 'Off';
  }
  
  if (entity.domain === 'sensor') {
    const unit = attributes.unit_of_measurement || '';
    return `${state}${unit}`;
  }
  
  if (entity.domain === 'binary_sensor') {
    return state === 'on' ? 'Active' : 'Inactive';
  }
  
  return state.charAt(0).toUpperCase() + state.slice(1);
};

const getManufacturerLogo = (manufacturer?: string) => {
  // Returning null - will use ManufacturerLogo component instead
  return null;
};

const DeviceCard = ({ device, index, onClick }: DeviceCardProps) => {
  const primaryEntity = device.entities.find(e => e.entity_id === device.primaryEntity) || device.entities[0];
  const isActive = device.entities.some(e => e.state === 'on' || e.state === 'playing' || e.state === 'home');

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={onClick}
      className="w-full text-left p-4 bg-white/[0.02] backdrop-blur-xl border border-white/5 
                 rounded-xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Device Icon */}
          <div className={`flex-shrink-0 p-2.5 rounded-lg transition-colors ${
            isActive 
              ? 'bg-[hsl(43_88%_60%)]/10' 
              : 'bg-white/5'
          }`}>
            <DeviceTypeIcon 
              type={device.deviceType} 
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

            {/* Entity Hierarchy - All capabilities */}
            {device.entities.length > 1 && (
              <div className="space-y-1.5 mt-2.5">
                {device.entities.slice(0, 4).map((entity) => {
                  const Icon = getEntityIcon(entity);
                  const value = formatEntityValue(entity);
                  const isEntityActive = entity.state === 'on' || entity.state === 'playing';
                  
                  // Extract entity label (remove device name prefix)
                  let entityLabel = entity.friendly_name;
                  if (entityLabel.startsWith(device.name)) {
                    entityLabel = entityLabel.substring(device.name.length).trim();
                  }
                  if (!entityLabel) {
                    entityLabel = entity.domain.charAt(0).toUpperCase() + entity.domain.slice(1);
                  }
                  
                  return (
                    <div 
                      key={entity.entity_id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Icon className={`w-3 h-3 flex-shrink-0 transition-colors ${
                        isEntityActive ? 'text-[hsl(43_88%_60%)]' : 'text-white/40'
                      }`} />
                      <span className="text-white/50 truncate flex-1 min-w-0 font-light">
                        {entityLabel}
                      </span>
                      <span className={`font-light flex-shrink-0 transition-colors ${
                        isEntityActive ? 'text-[hsl(43_88%_60%)]' : 'text-white/70'
                      }`}>
                        {value}
                      </span>
                    </div>
                  );
                })}
                {device.entities.length > 4 && (
                  <div className="text-[11px] text-white/30 font-light">
                    +{device.entities.length - 4} more
                  </div>
                )}
              </div>
            )}

            {/* Single entity display */}
            {device.entities.length === 1 && (
              <div className="text-xs font-light text-white/50 mt-1">
                {formatEntityValue(primaryEntity)}
              </div>
            )}

            {/* Capabilities Pills */}
            {device.entities.some(e => e.capabilities.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {Array.from(new Set(device.entities.flatMap(e => e.capabilities))).slice(0, 3).map(cap => (
                  <span 
                    key={cap}
                    className="px-2 py-0.5 rounded text-[10px] font-light bg-white/5 text-white/40 border border-white/5"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Expand Arrow */}
        {onClick && (
          <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 
                                  transition-colors flex-shrink-0 mt-1" />
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
    </motion.button>
  );
};

export default DeviceCard;
