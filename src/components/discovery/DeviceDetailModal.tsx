import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Zap, Info, Clock, Activity, Code, Settings } from 'lucide-react';
import { DiscoveredDevice, DiscoveredEntity } from '@/types/discovery';
import DeviceTypeIcon from './DeviceTypeIcon';
import ManufacturerLogo from './ManufacturerLogo';
import DeviceWidget from './DeviceWidget';
import AreaAssignmentDropdown from './AreaAssignmentDropdown';
import { EntityControl, isControllable } from './EntityControl';
import { useHomeAssistantConfig } from '@/hooks/useHomeAssistantConfig';
import { homeAssistant } from '@/services/homeAssistant';
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
  const { config } = useHomeAssistantConfig();
  const [liveEntities, setLiveEntities] = useState<DiscoveredEntity[]>(device?.entities || []);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // Real-time updates from Home Assistant
  useEffect(() => {
    if (!isOpen || !device) return;

    // Initialize with device entities
    setLiveEntities(device.entities);
    setLastUpdated(new Date());

    // If no HA config, stop here (demo mode)
    if (!config) {
      console.log('💡 Running in demo mode - no real-time updates');
      return;
    }

    const updateEntityStates = async () => {
      setIsUpdating(true);
      try {
        const updatedEntities = await Promise.all(
          device.entities.map(async (entity) => {
            try {
              const state = await homeAssistant.getEntityState(entity.entity_id);
              if (state) {
                return {
                  ...entity,
                  state: state.state,
                  attributes: { ...entity.attributes, ...state.attributes }
                };
              }
              return entity;
            } catch (error) {
              console.error(`❌ Error fetching state for ${entity.entity_id}:`, error);
              return entity;
            }
          })
        );
        setLiveEntities(updatedEntities);
        setLastUpdated(new Date());
        console.log(`✅ Updated ${updatedEntities.length} entities for ${device.name}`);
      } catch (error) {
        console.error('❌ Error updating device states:', error);
      } finally {
        setIsUpdating(false);
      }
    };

    // Initial fetch
    console.log(`🔄 Starting real-time updates for ${device.name}`);
    updateEntityStates();

    // Poll every 2 seconds for real-time updates
    const interval = setInterval(updateEntityStates, 2000);

    return () => {
      console.log(`⏹️ Stopping real-time updates for ${device.name}`);
      clearInterval(interval);
    };
  }, [isOpen, config, device]);

  // Format attributes for display
  const formatAttributeValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      try {
        const json = JSON.stringify(value, null, 2);
        // If object is too large, show truncated version
        return json.length > 200 ? json.substring(0, 200) + '...' : json;
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  // Early return after all hooks
  if (!device) return null;

  const primaryEntity = liveEntities.find(e => e.entity_id === device.primaryEntity) || liveEntities[0];
  const isActive = liveEntities.some(e => e.state === 'on' || e.state === 'playing' || e.state === 'home');

  // If no entities available, show message
  if (!primaryEntity || liveEntities.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-[hsl(28,20%,18%)]/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>No Entities Found</DialogTitle>
          </DialogHeader>
          <p className="text-white/60">This device has no available entities to display.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const controllableEntities = liveEntities.filter(e => isControllable(e.domain));

  const handleEntityStateChange = (entityId: string, newState: any) => {
    setLiveEntities(prev => prev.map(e => 
      e.entity_id === entityId 
        ? { ...e, state: newState.state || e.state, attributes: { ...e.attributes, ...newState.attributes } }
        : e
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[hsl(28,20%,18%)]/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-[hsl(43_88%_60%)]/10' 
                  : 'bg-white/5'
              }`}>
                <DeviceTypeIcon 
                  type={device.deviceType} 
                  deviceClass={primaryEntity.device_class}
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
                    {device.manufacturer} {device.model && `• ${device.model}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {config && (
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <Activity className={`w-3 h-3 ${isUpdating ? 'animate-pulse text-[hsl(44,85%,58%)]' : ''}`} />
                  <span>Live</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <Clock className="w-3 h-3" />
                <span>{lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick Controls Section */}
          {controllableEntities.length > 0 && (
            <motion.div
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              <h3 className="text-sm font-light text-white/70 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" strokeWidth={1.5} />
                Quick Controls
              </h3>
              <div className="space-y-2">
                {controllableEntities.map((entity) => (
                  <EntityControl 
                    key={entity.entity_id}
                    entity={entity}
                    onStateChange={handleEntityStateChange}
                    isConnected={!!config}
                  />
                ))}
              </div>
            </motion.div>
          )}

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

          {/* All Entities with Attributes */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="text-sm font-light text-white/70 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" strokeWidth={1.5} />
              All Entities ({liveEntities.length})
            </h3>
            <div className="space-y-3">
              {liveEntities.map((entity) => (
                <motion.div
                  key={entity.entity_id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="space-y-3">
                    {/* Entity Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <code className="text-xs font-mono text-white/50 truncate">
                            {entity.entity_id}
                          </code>
                          {entity.entity_id === device.primaryEntity && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(44,85%,58%)]/20 text-[hsl(44,85%,58%)] font-light">
                              Primary
                            </span>
                          )}
                          <DeviceTypeIcon 
                            type={device.deviceType}
                            deviceClass={entity.device_class}
                            state={entity.state}
                            className="w-3.5 h-3.5"
                          />
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
                      <div className="text-right flex-shrink-0">
                        <motion.div 
                          key={entity.state}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          className={`text-sm font-medium ${
                            entity.state === 'on' || entity.state === 'playing' || entity.state === 'home'
                              ? 'text-[hsl(44,85%,58%)]'
                              : 'text-white/50'
                          }`}
                        >
                          {entity.state}
                        </motion.div>
                        <p className="text-xs text-white/40 mt-0.5">{entity.domain}</p>
                      </div>
                    </div>

                    {/* Entity Attributes */}
                    {Object.keys(entity.attributes).length > 0 && (
                      <details className="group">
                        <summary className="cursor-pointer flex items-center gap-2 text-xs text-white/50 hover:text-white/70 transition-colors list-none">
                          <Code className="w-3 h-3" />
                          <span>Attributes ({Object.keys(entity.attributes).length})</span>
                          <span className="ml-auto text-[10px] text-white/30 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-2 space-y-1 pl-5">
                          {Object.entries(entity.attributes)
                            .filter(([key]) => key !== 'friendly_name') // Hide friendly_name as it's already shown
                            .map(([key, value]) => (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-2 text-[11px]"
                              >
                                <span className="text-white/40 font-mono min-w-[120px]">{key}:</span>
                                <span className="text-white/60 flex-1 break-all font-light">
                                  {formatAttributeValue(value)}
                                </span>
                              </motion.div>
                            ))}
                        </div>
                      </details>
                    )}
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
