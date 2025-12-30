import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Lightbulb, 
  Thermometer, 
  Droplets, 
  Wind, 
  Battery, 
  Music,
  Plus,
  Check,
  ChevronDown,
  Radar,
  Sparkles
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
  lights: { icon: Lightbulb, label: 'Lights', color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  temperature: { icon: Thermometer, label: 'Temperature', color: 'text-red-400', bgColor: 'bg-red-400/10' },
  humidity: { icon: Droplets, label: 'Humidity', color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  airQuality: { icon: Wind, label: 'Air Quality', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
  battery: { icon: Battery, label: 'Battery', color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  mediaPlayers: { icon: Music, label: 'Media', color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
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

    if (domain === 'light') {
      result.lights.push(discovered);
      return;
    }

    if (domain === 'media_player') {
      result.mediaPlayers.push(discovered);
      return;
    }

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

  const unconfiguredCount = entities
    ? Object.values(entities).flat().filter(e => !isConfigured(e.entity_id)).length
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
    <div className="rounded-2xl bg-secondary/30 border border-border/30 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-warm-glow/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-warm-glow" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground/90">Auto Discovery</h3>
            <p className="text-xs text-muted-foreground">Find available devices</p>
          </div>
        </div>

        {/* Scan Button */}
        <motion.button
          onClick={scanForDevices}
          disabled={!isConnected || isScanning}
          whileHover={isConnected && !isScanning ? { scale: 1.02 } : {}}
          whileTap={isConnected && !isScanning ? { scale: 0.98 } : {}}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            transition-all duration-200
            ${isConnected 
              ? 'bg-warm-glow/10 hover:bg-warm-glow/20 text-warm-glow border border-warm-glow/20' 
              : 'bg-secondary/30 text-muted-foreground cursor-not-allowed border border-border/20'
            }
          `}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Radar className="w-4 h-4" />
              <span>Scan</span>
            </>
          )}
        </motion.button>
      </div>

      {error && (
        <div className="px-5 pb-4">
          <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {entities && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Toggle header */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between px-5 py-3 border-t border-border/20 hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground/70">
                  {totalEntities} devices found
                </span>
                {unconfiguredCount > 0 && (
                  <span className="text-xs text-warm-glow bg-warm-glow/10 px-2 py-0.5 rounded-full">
                    {unconfiguredCount} new
                  </span>
                )}
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-foreground/40" />
              </motion.div>
            </button>

            {/* Entity list */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 0.03, 0.26, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2 max-h-[400px] overflow-y-auto">
                    {allEntitiesList.map((entity, index) => {
                      const configured = isConfigured(entity.entity_id);
                      const config = CATEGORY_CONFIG[entity.category];
                      const Icon = config.icon;
                      
                      return (
                        <motion.div
                          key={entity.entity_id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className={`
                            group flex items-center gap-3 p-3 rounded-xl
                            transition-all duration-200
                            ${configured 
                              ? 'bg-warm-glow/5 border border-warm-glow/20' 
                              : 'bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border/30'
                            }
                          `}
                        >
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={1.5} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-light text-foreground/90 truncate">
                              {entity.friendly_name}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                              <span className="font-mono truncate max-w-[180px]">{entity.entity_id}</span>
                              <span>•</span>
                              <span className={entity.state === 'on' ? 'text-status-optimal' : ''}>
                                {entity.state}
                              </span>
                            </div>
                          </div>

                          {/* Add Button */}
                          <motion.button
                            onClick={() => handleAddEntity(entity, entity.category)}
                            disabled={configured}
                            whileHover={!configured ? { scale: 1.05 } : {}}
                            whileTap={!configured ? { scale: 0.95 } : {}}
                            className={`
                              flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                              transition-all duration-200
                              ${configured 
                                ? 'bg-warm-glow/10 text-warm-glow cursor-default' 
                                : 'bg-secondary/50 hover:bg-warm-glow/20 text-foreground/40 hover:text-warm-glow'
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
                      <p className="text-sm text-muted-foreground/60 text-center py-8">
                        No supported devices found
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
