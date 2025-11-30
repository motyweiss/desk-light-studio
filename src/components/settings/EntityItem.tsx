import { 
  Lightbulb, 
  Lamp, 
  SunMedium, 
  Thermometer, 
  Droplets, 
  Wind, 
  Battery, 
  Speaker, 
  Music,
  HelpCircle
} from "lucide-react";

interface EntityItemProps {
  entity: {
    entity_id: string;
    state: string;
    attributes: {
      friendly_name?: string;
      brightness?: number;
      device_class?: string;
      unit_of_measurement?: string;
    };
    area_name?: string;
    device_name?: string;
  };
  isSelected?: boolean;
}

const getEntityIcon = (entityId: string, deviceClass?: string) => {
  const domain = entityId.split('.')[0];
  
  if (domain === 'light') {
    if (entityId.includes('spot') || entityId.includes('wall')) {
      return SunMedium;
    }
    if (entityId.includes('lamp') || entityId.includes('go')) {
      return Lamp;
    }
    return Lightbulb;
  }
  
  if (domain === 'sensor') {
    if (deviceClass === 'temperature' || entityId.includes('temperature')) {
      return Thermometer;
    }
    if (deviceClass === 'humidity' || entityId.includes('humidity')) {
      return Droplets;
    }
    if (deviceClass === 'pm25' || entityId.includes('pm') || entityId.includes('air')) {
      return Wind;
    }
    if (deviceClass === 'battery' || entityId.includes('battery')) {
      return Battery;
    }
  }
  
  if (domain === 'media_player') {
    if (entityId.includes('spotify')) {
      return Music;
    }
    return Speaker;
  }
  
  return HelpCircle;
};

const formatState = (entity: EntityItemProps['entity']) => {
  const { state, attributes } = entity;
  const domain = entity.entity_id.split('.')[0];
  
  if (domain === 'light') {
    if (state === 'on' && attributes.brightness !== undefined) {
      const brightnessPct = Math.round((attributes.brightness / 255) * 100);
      return `On (${brightnessPct}%)`;
    }
    return state === 'on' ? 'On' : 'Off';
  }
  
  if (domain === 'sensor') {
    const unit = attributes.unit_of_measurement || '';
    return `${state}${unit}`;
  }
  
  if (domain === 'media_player') {
    return state.charAt(0).toUpperCase() + state.slice(1);
  }
  
  return state;
};

export const EntityItem = ({ entity, isSelected }: EntityItemProps) => {
  const Icon = getEntityIcon(entity.entity_id, entity.attributes.device_class);
  const displayName = entity.attributes.friendly_name || entity.entity_id;
  const currentState = formatState(entity);
  
  return (
    <div className="flex items-start gap-3 w-full">
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[hsl(43_88%_60%)]" strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-light text-white truncate">
          {displayName}
        </div>
        
        {(entity.area_name || entity.device_name) && (
          <div className="flex items-center gap-2 mt-0.5 text-xs text-white/40 font-light">
            {entity.area_name && (
              <span className="truncate">{entity.area_name}</span>
            )}
            {entity.area_name && entity.device_name && (
              <span>•</span>
            )}
            {entity.device_name && (
              <span className="truncate">{entity.device_name}</span>
            )}
          </div>
        )}
        
        <div className="mt-1 text-xs text-white/50 font-light">
          Currently: {currentState}
        </div>
      </div>
      
      {isSelected && (
        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-[hsl(43_88%_60%)] flex items-center justify-center mt-1">
          <div className="w-2 h-2 rounded-full bg-[hsl(28_18%_10%)]" />
        </div>
      )}
    </div>
  );
};
