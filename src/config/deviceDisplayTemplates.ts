import { DiscoveredEntity, DeviceType } from '@/types/discovery';

export interface DisplayableValue {
  id: string;
  label: string;
  icon: string;
  value: string | number;
  unit?: string;
  widgetType: 'value' | 'status';
  isActive?: boolean;
}

export interface DeviceDisplayTemplate {
  deviceType: DeviceType;
  manufacturer?: string;
  displayName: string;
  icon: string;
  extractDisplayableValues: (entities: DiscoveredEntity[]) => DisplayableValue[];
}

// Helper to format values
const formatValue = (value: string | number, decimals: number = 1): string => {
  const num = parseFloat(String(value));
  return isNaN(num) ? String(value) : num.toFixed(decimals);
};

// Templates for different device types
export const displayTemplates: Record<string, DeviceDisplayTemplate> = {
  // Dyson Air Purifier
  'sensor_dyson': {
    deviceType: 'sensor',
    manufacturer: 'Dyson',
    displayName: 'Air Purifier',
    icon: 'Wind',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      
      entities.forEach(e => {
        if (e.device_class === 'temperature') {
          values.push({
            id: 'temperature',
            label: 'Temperature',
            icon: 'Thermometer',
            value: formatValue(e.state),
            unit: '°C',
            widgetType: 'value'
          });
        }
        if (e.device_class === 'humidity') {
          values.push({
            id: 'humidity',
            label: 'Humidity',
            icon: 'Droplets',
            value: parseInt(e.state),
            unit: '%',
            widgetType: 'value'
          });
        }
        if (e.device_class === 'pm25') {
          values.push({
            id: 'pm25',
            label: 'Air Quality',
            icon: 'Wind',
            value: parseInt(e.state),
            unit: 'µg/m³',
            widgetType: 'value'
          });
        }
      });
      
      return values;
    }
  },
  
  // Philips Hue Lights
  'light_philips': {
    deviceType: 'light',
    manufacturer: 'Philips Hue',
    displayName: 'Smart Light',
    icon: 'Lightbulb',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const lightEntity = entities.find(e => e.domain === 'light');
      
      if (lightEntity) {
        const isOn = lightEntity.state === 'on';
        values.push({
          id: 'state',
          label: 'Status',
          icon: 'Lightbulb',
          value: isOn ? 'On' : 'Off',
          widgetType: 'status',
          isActive: isOn
        });
        
        if (isOn && lightEntity.attributes.brightness) {
          values.push({
            id: 'brightness',
            label: 'Brightness',
            icon: 'Sun',
            value: Math.round((lightEntity.attributes.brightness / 255) * 100),
            unit: '%',
            widgetType: 'value',
            isActive: true
          });
        }
      }
      
      return values;
    }
  },
  
  // Generic Light
  'light': {
    deviceType: 'light',
    displayName: 'Light',
    icon: 'Lightbulb',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const lightEntity = entities.find(e => e.domain === 'light');
      
      if (lightEntity) {
        const isOn = lightEntity.state === 'on';
        values.push({
          id: 'state',
          label: 'Status',
          icon: 'Lightbulb',
          value: isOn ? 'On' : 'Off',
          widgetType: 'status',
          isActive: isOn
        });
        
        if (isOn && lightEntity.attributes.brightness) {
          values.push({
            id: 'brightness',
            label: 'Brightness',
            icon: 'Sun',
            value: Math.round((lightEntity.attributes.brightness / 255) * 100),
            unit: '%',
            widgetType: 'value',
            isActive: true
          });
        }
      }
      
      return values;
    }
  },
  
  // Apple Device Battery
  'battery_apple': {
    deviceType: 'battery',
    manufacturer: 'Apple',
    displayName: 'Device',
    icon: 'Smartphone',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      
      const batteryEntity = entities.find(e => 
        e.device_class === 'battery' || 
        e.entity_id.includes('battery_level')
      );
      
      if (batteryEntity) {
        const batteryLevel = parseInt(batteryEntity.state);
        values.push({
          id: 'battery',
          label: 'Battery',
          icon: 'Battery',
          value: batteryLevel,
          unit: '%',
          widgetType: 'value',
          isActive: batteryLevel > 20
        });
      }
      
      const chargingEntity = entities.find(e => 
        e.entity_id.includes('battery_state') || 
        e.friendly_name.toLowerCase().includes('charging')
      );
      
      if (chargingEntity) {
        const isCharging = chargingEntity.state.toLowerCase().includes('charging') && 
                          !chargingEntity.state.toLowerCase().includes('not');
        if (isCharging) {
          values.push({
            id: 'charging',
            label: 'Status',
            icon: 'Zap',
            value: 'Charging',
            widgetType: 'status',
            isActive: true
          });
        }
      }
      
      return values;
    }
  },
  
  // Sonos Media Player
  'media_player_sonos': {
    deviceType: 'media_player',
    manufacturer: 'Sonos',
    displayName: 'Speaker',
    icon: 'Speaker',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const mediaEntity = entities.find(e => e.domain === 'media_player');
      
      if (mediaEntity) {
        const isPlaying = mediaEntity.state === 'playing';
        const mediaTitle = mediaEntity.attributes.media_title;
        
        values.push({
          id: 'playback',
          label: 'Status',
          icon: 'Music',
          value: isPlaying && mediaTitle ? mediaTitle : mediaEntity.state,
          widgetType: 'status',
          isActive: isPlaying
        });
        
        if (mediaEntity.attributes.volume_level !== undefined) {
          values.push({
            id: 'volume',
            label: 'Volume',
            icon: 'Volume2',
            value: Math.round(mediaEntity.attributes.volume_level * 100),
            unit: '%',
            widgetType: 'value'
          });
        }
      }
      
      return values;
    }
  },
  
  // Generic Media Player
  'media_player': {
    deviceType: 'media_player',
    displayName: 'Media Player',
    icon: 'Music',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const mediaEntity = entities.find(e => e.domain === 'media_player');
      
      if (mediaEntity) {
        const isPlaying = mediaEntity.state === 'playing';
        const mediaTitle = mediaEntity.attributes.media_title;
        
        values.push({
          id: 'playback',
          label: 'Status',
          icon: 'Music',
          value: isPlaying && mediaTitle ? mediaTitle : mediaEntity.state,
          widgetType: 'status',
          isActive: isPlaying
        });
      }
      
      return values;
    }
  }
};

// Function to get template for a device
export const getDeviceTemplate = (
  deviceType: DeviceType, 
  manufacturer?: string
): DeviceDisplayTemplate | null => {
  // Try manufacturer-specific template first
  if (manufacturer) {
    const key = `${deviceType}_${manufacturer.toLowerCase().replace(/\s+/g, '_')}`;
    if (displayTemplates[key]) {
      return displayTemplates[key];
    }
  }
  
  // Fall back to generic template
  if (displayTemplates[deviceType]) {
    return displayTemplates[deviceType];
  }
  
  return null;
};
