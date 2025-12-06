import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
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
import { haClient } from "@/api/homeAssistant/client";
import { HAEntity } from "@/services/homeAssistant";

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
  lights: { icon: Lightbulb, label: 'Lights', color: 'hsl(43 88% 60%)' },
  temperature: { icon: Thermometer, label: 'Temperature Sensors', color: 'hsl(0 75% 55%)' },
  humidity: { icon: Droplets, label: 'Humidity Sensors', color: 'hsl(200 70% 55%)' },
  airQuality: { icon: Wind, label: 'Air Quality Sensors', color: 'hsl(142 70% 45%)' },
  battery: { icon: Battery, label: 'Battery Sensors', color: 'hsl(43 88% 60%)' },
  mediaPlayers: { icon: Speaker, label: 'Media Players', color: 'hsl(280 60% 55%)' },
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
      // Temperature
      if (deviceClass === 'temperature' || entityId.includes('temperature') || entityId.includes('temp')) {
        result.temperature.push(discovered);
        return;
      }

      // Humidity
      if (deviceClass === 'humidity' || entityId.includes('humidity')) {
        result.humidity.push(discovered);
        return;
      }

      // Air Quality (PM2.5, PM10, AQI)
      if (deviceClass === 'pm25' || deviceClass === 'pm10' || deviceClass === 'aqi' || 
          entityId.includes('pm_2_5') || entityId.includes('pm2') || entityId.includes('pm10') ||
          entityId.includes('air_quality') || entityId.includes('aqi')) {
        result.airQuality.push(discovered);
        return;
      }

      // Battery
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
      const allEntities = await haClient.getAllStates();
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

  const renderEntityList = (categoryKey: keyof CategorizedEntities, entityList: DiscoveredEntity[]) => {
    if (entityList.length === 0) return null;

    const config = CATEGORY_CONFIG[categoryKey];
    const Icon = config.icon;

    return (
      <div key={categoryKey} className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-white/60 uppercase tracking-wider">
          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
          {config.label} ({entityList.length})
        </div>
        
        <div className="space-y-1">
          {entityList.map(entity => {
            const configured = isConfigured(entity.entity_id);
            
            return (
              <motion.div
                key={entity.entity_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  flex items-center justify-between gap-3 p-2.5 rounded-lg
                  ${configured ? 'bg-white/5 opacity-60' : 'bg-white/[0.03] hover:bg-white/[0.06]'}
                  transition-colors duration-200
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-light text-white truncate">
                    {entity.friendly_name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/40 font-light">
                    <span className="font-mono truncate">{entity.entity_id}</span>
                    {entity.state && (
                      <>
                        <span>•</span>
                        <span>{entity.state}{entity.unit_of_measurement || ''}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAddEntity(entity, categoryKey)}
                  disabled={configured}
                  className={`
                    flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                    transition-all duration-200
                    ${configured 
                      ? 'bg-[hsl(43_88%_60%)]/20 text-[hsl(43_88%_60%)] cursor-default' 
                      : 'bg-white/10 hover:bg-[hsl(43_88%_60%)]/30 text-white/70 hover:text-[hsl(43_88%_60%)]'
                    }
                  `}
                >
                  {configured ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const totalEntities = entities 
    ? Object.values(entities).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  return (
    <div className="space-y-3">
      {/* Scan Button */}
      <button
        onClick={scanForDevices}
        disabled={!isConnected || isScanning}
        className={`
          w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg
          text-sm font-light transition-all duration-200
          ${isConnected 
            ? 'bg-[hsl(43_88%_60%)]/10 hover:bg-[hsl(43_88%_60%)]/20 text-[hsl(43_88%_60%)] border border-[hsl(43_88%_60%)]/20' 
            : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
          }
        `}
      >
        {isScanning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning for devices...
          </>
        ) : entities ? (
          <>
            <RefreshCw className="w-4 h-4" />
            Rescan ({totalEntities} devices found)
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Scan for Available Devices
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400/80 text-center">{error}</p>
      )}

      {/* Results */}
      <AnimatePresence>
        {entities && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              {/* Toggle header */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                <span>Discovered Devices</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Entity categories */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 -mr-1">
                {renderEntityList('lights', entities.lights)}
                {renderEntityList('temperature', entities.temperature)}
                {renderEntityList('humidity', entities.humidity)}
                {renderEntityList('airQuality', entities.airQuality)}
                {renderEntityList('battery', entities.battery)}
                {renderEntityList('mediaPlayers', entities.mediaPlayers)}
              </div>

              {totalEntities === 0 && (
                <p className="text-xs text-white/40 text-center py-4">
                  No supported devices found. Make sure your Home Assistant has available entities.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};