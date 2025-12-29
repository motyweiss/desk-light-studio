import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Lightbulb, 
  Thermometer, 
  Droplets, 
  Wind, 
  Battery, 
  Speaker,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";
import { homeAssistant, HAEntity } from "@/services/homeAssistant";

interface DiscoveredEntity {
  entity_id: string;
  friendly_name: string;
  state: string;
  device_class?: string;
  unit_of_measurement?: string;
  area_name?: string;
  device_name?: string;
}

interface CategorizedEntities {
  lights: DiscoveredEntity[];
  temperature: DiscoveredEntity[];
  humidity: DiscoveredEntity[];
  airQuality: DiscoveredEntity[];
  battery: DiscoveredEntity[];
  mediaPlayers: DiscoveredEntity[];
}

interface EntityAutoDiscoveryProps {
  onAddEntity: (entity: DiscoveredEntity, category: 'lights' | 'sensors' | 'mediaPlayers', sensorType?: 'temperature' | 'humidity' | 'air_quality' | 'battery') => void;
  configuredEntityIds: string[];
  isConnected: boolean;
}

const CATEGORY_CONFIG = {
  lights: { icon: Lightbulb, label: 'Lights', color: 'text-amber-400' },
  temperature: { icon: Thermometer, label: 'Temperature', color: 'text-red-400' },
  humidity: { icon: Droplets, label: 'Humidity', color: 'text-blue-400' },
  airQuality: { icon: Wind, label: 'Air Quality', color: 'text-emerald-400' },
  battery: { icon: Battery, label: 'Battery', color: 'text-amber-400' },
  mediaPlayers: { icon: Speaker, label: 'Media Players', color: 'text-purple-400' },
};

const categorizeEntities = (entities: HAEntity[]): CategorizedEntities => {
  const result: CategorizedEntities = {
    lights: [],
    temperature: [],
    humidity: [],
    airQuality: [],
    battery: [],
    mediaPlayers: [],
  };

  entities.forEach(entity => {
    const entityId = entity.entity_id.toLowerCase();
    const domain = entityId.split('.')[0];
    const deviceClass = entity.attributes?.device_class?.toLowerCase() || '';
    const friendlyName = entity.attributes?.friendly_name || entity.entity_id;

    const discovered: DiscoveredEntity = {
      entity_id: entity.entity_id,
      friendly_name: friendlyName,
      state: entity.state,
      device_class: entity.attributes?.device_class,
      unit_of_measurement: entity.attributes?.unit_of_measurement,
    };

    // Lights
    if (domain === 'light') {
      result.lights.push(discovered);
      return;
    }

    // Media Players
    if (domain === 'media_player') {
      result.mediaPlayers.push(discovered);
      return;
    }

    // Sensors - categorize by device_class or entity name
    if (domain === 'sensor') {
      if (deviceClass === 'temperature' || entityId.includes('temperature') || entityId.includes('temp')) {
        result.temperature.push(discovered);
        return;
      }

      if (deviceClass === 'humidity' || entityId.includes('humidity')) {
        result.humidity.push(discovered);
        return;
      }

      if (deviceClass === 'pm25' || deviceClass === 'pm10' || deviceClass === 'aqi' || 
          entityId.includes('pm_2_5') || entityId.includes('pm2') || entityId.includes('pm10') ||
          entityId.includes('air_quality') || entityId.includes('aqi')) {
        result.airQuality.push(discovered);
        return;
      }

      if (deviceClass === 'battery' || entityId.includes('battery')) {
        result.battery.push(discovered);
        return;
      }
    }
  });

  return result;
};

export const EntityAutoDiscovery = ({ 
  onAddEntity, 
  configuredEntityIds,
  isConnected 
}: EntityAutoDiscoveryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [entities, setEntities] = useState<CategorizedEntities | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanForDevices = useCallback(async () => {
    if (!isConnected) {
      setError('Not connected to Home Assistant');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const allEntities = await homeAssistant.getEntitiesWithContext();
      const categorized = categorizeEntities(allEntities);
      setEntities(categorized);
      setIsExpanded(true);
    } catch (err) {
      console.error('Failed to scan entities:', err);
      setError('Failed to scan for devices. Check your connection.');
    } finally {
      setIsScanning(false);
    }
  }, [isConnected]);

  const handleAddEntity = (entity: DiscoveredEntity, categoryKey: keyof CategorizedEntities) => {
    let targetCategory: 'lights' | 'sensors' | 'mediaPlayers' = 'sensors';
    let sensorType: 'temperature' | 'humidity' | 'air_quality' | 'battery' | undefined;

    if (categoryKey === 'lights') {
      targetCategory = 'lights';
    } else if (categoryKey === 'mediaPlayers') {
      targetCategory = 'mediaPlayers';
    } else {
      targetCategory = 'sensors';
      if (categoryKey === 'temperature') sensorType = 'temperature';
      else if (categoryKey === 'humidity') sensorType = 'humidity';
      else if (categoryKey === 'airQuality') sensorType = 'air_quality';
      else if (categoryKey === 'battery') sensorType = 'battery';
    }

    onAddEntity(entity, targetCategory, sensorType);
  };

  const isConfigured = (entityId: string) => configuredEntityIds.includes(entityId);

  const totalEntities = entities 
    ? Object.values(entities).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  // Flatten all entities for the unified list
  const allEntitiesList = entities ? [
    ...entities.lights.map(e => ({ ...e, category: 'lights' as const })),
    ...entities.temperature.map(e => ({ ...e, category: 'temperature' as const })),
    ...entities.humidity.map(e => ({ ...e, category: 'humidity' as const })),
    ...entities.airQuality.map(e => ({ ...e, category: 'airQuality' as const })),
    ...entities.battery.map(e => ({ ...e, category: 'battery' as const })),
    ...entities.mediaPlayers.map(e => ({ ...e, category: 'mediaPlayers' as const })),
  ] : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <h3 className="text-sm font-light text-white/70">Auto Discovery</h3>

      {/* Scan Button */}
      <motion.button
        onClick={scanForDevices}
        disabled={!isConnected || isScanning}
        whileHover={isConnected && !isScanning ? { scale: 1.01 } : {}}
        whileTap={isConnected && !isScanning ? { scale: 0.99 } : {}}
        className={`
          w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl
          text-sm font-light transition-all duration-300
          border-2
          ${isConnected 
            ? 'bg-transparent hover:bg-amber-500/5 text-amber-400 border-amber-400/30 hover:border-amber-400/50' 
            : 'bg-white/[0.02] text-white/30 cursor-not-allowed border-white/10'
          }
        `}
      >
        {isScanning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Scanning for devices...</span>
          </>
        ) : entities ? (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>Rescan ({totalEntities} devices found)</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>Scan for Available Devices</span>
          </>
        )}
      </motion.button>

      {error && (
        <p className="text-xs text-red-400/80 text-center">{error}</p>
      )}

      {/* Results */}
      <AnimatePresence>
        {entities && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              {/* Toggle header */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
              >
                <span className="font-light">Discovered Devices</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Entity list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 max-h-[500px] overflow-y-auto"
                  >
                    {allEntitiesList.map((entity, index) => {
                      const configured = isConfigured(entity.entity_id);
                      const config = CATEGORY_CONFIG[entity.category];
                      const Icon = config.icon;
                      
                      return (
                        <motion.div
                          key={entity.entity_id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.015 }}
                          className={`
                            group flex items-center justify-between gap-4 p-4 rounded-2xl
                            transition-all duration-200
                            ${configured 
                              ? 'bg-white/[0.04] border border-amber-400/20' 
                              : 'bg-white/[0.03] hover:bg-white/[0.05] border border-transparent hover:border-white/10'
                            }
                          `}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`mt-0.5 ${config.color}`}>
                              <Icon className="w-4 h-4" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[15px] font-light text-white leading-snug">
                                {entity.friendly_name}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-white/40 font-light">
                                <span className="font-mono truncate">{entity.entity_id}</span>
                                <span className="text-white/20">•</span>
                                <span className={entity.state === 'on' ? 'text-emerald-400/70' : 'text-white/30'}>
                                  {entity.state}
                                </span>
                              </div>
                            </div>
                          </div>

                          <motion.button
                            onClick={() => handleAddEntity(entity, entity.category)}
                            disabled={configured}
                            whileHover={!configured ? { scale: 1.1 } : {}}
                            whileTap={!configured ? { scale: 0.95 } : {}}
                            className={`
                              flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                              transition-all duration-200
                              ${configured 
                                ? 'bg-amber-400/10 text-amber-400 cursor-default' 
                                : 'bg-white/[0.06] hover:bg-amber-400/20 text-white/50 hover:text-amber-400'
                              }
                            `}
                          >
                            {configured ? (
                              <Check className="w-4 h-4" strokeWidth={2} />
                            ) : (
                              <Plus className="w-4 h-4" strokeWidth={2} />
                            )}
                          </motion.button>
                        </motion.div>
                      );
                    })}

                    {totalEntities === 0 && (
                      <p className="text-sm text-white/40 text-center py-8 font-light">
                        No supported devices found
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
