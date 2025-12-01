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
  },

  // Climate (AC/Thermostat)
  'climate': {
    deviceType: 'climate',
    displayName: 'Climate Control',
    icon: 'Thermometer',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const climateEntity = entities.find(e => e.domain === 'climate');
      
      if (climateEntity) {
        const isOn = climateEntity.state !== 'off';
        const currentTemp = climateEntity.attributes.current_temperature;
        const targetTemp = climateEntity.attributes.temperature;
        const mode = climateEntity.attributes.hvac_mode;
        
        if (currentTemp !== undefined) {
          values.push({
            id: 'current_temp',
            label: 'Current',
            icon: 'Thermometer',
            value: formatValue(currentTemp),
            unit: '°C',
            widgetType: 'value',
            isActive: isOn
          });
        }
        
        if (targetTemp !== undefined) {
          values.push({
            id: 'target_temp',
            label: 'Target',
            icon: 'Target',
            value: formatValue(targetTemp),
            unit: '°C',
            widgetType: 'value',
            isActive: isOn
          });
        }
        
        if (mode) {
          values.push({
            id: 'mode',
            label: 'Mode',
            icon: 'Wind',
            value: mode,
            widgetType: 'status',
            isActive: isOn
          });
        }
      }
      
      return values;
    }
  },

  // Cover (Blinds/Curtains)
  'cover': {
    deviceType: 'cover',
    displayName: 'Cover',
    icon: 'Blinds',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const coverEntity = entities.find(e => e.domain === 'cover');
      
      if (coverEntity) {
        const position = coverEntity.attributes.current_position;
        const isOpen = coverEntity.state === 'open';
        
        if (position !== undefined) {
          values.push({
            id: 'position',
            label: 'Position',
            icon: 'Percent',
            value: Math.round(position),
            unit: '%',
            widgetType: 'value',
            isActive: position > 0
          });
        }
        
        values.push({
          id: 'state',
          label: 'Status',
          icon: 'Blinds',
          value: isOpen ? 'Open' : 'Closed',
          widgetType: 'status',
          isActive: isOpen
        });
      }
      
      return values;
    }
  },

  // Vacuum
  'vacuum': {
    deviceType: 'vacuum',
    displayName: 'Vacuum',
    icon: 'Circle',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const vacuumEntity = entities.find(e => e.domain === 'vacuum');
      
      if (vacuumEntity) {
        const batteryEntity = entities.find(e => e.device_class === 'battery');
        const isActive = vacuumEntity.state === 'cleaning' || vacuumEntity.state === 'returning';
        
        values.push({
          id: 'state',
          label: 'Status',
          icon: 'Circle',
          value: vacuumEntity.state,
          widgetType: 'status',
          isActive
        });
        
        if (batteryEntity) {
          values.push({
            id: 'battery',
            label: 'Battery',
            icon: 'Battery',
            value: parseInt(batteryEntity.state),
            unit: '%',
            widgetType: 'value',
            isActive: parseInt(batteryEntity.state) > 20
          });
        }
      }
      
      return values;
    }
  },

  // Lock
  'lock': {
    deviceType: 'lock',
    displayName: 'Lock',
    icon: 'Lock',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const lockEntity = entities.find(e => e.domain === 'lock');
      
      if (lockEntity) {
        const isLocked = lockEntity.state === 'locked';
        values.push({
          id: 'state',
          label: 'Status',
          icon: isLocked ? 'Lock' : 'LockOpen',
          value: isLocked ? 'Locked' : 'Unlocked',
          widgetType: 'status',
          isActive: isLocked
        });
      }
      
      return values;
    }
  },

  // Fan
  'fan': {
    deviceType: 'fan',
    displayName: 'Fan',
    icon: 'Fan',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const fanEntity = entities.find(e => e.domain === 'fan');
      
      if (fanEntity) {
        const isOn = fanEntity.state === 'on';
        const speed = fanEntity.attributes.percentage;
        
        values.push({
          id: 'state',
          label: 'Status',
          icon: 'Fan',
          value: isOn ? 'On' : 'Off',
          widgetType: 'status',
          isActive: isOn
        });
        
        if (speed !== undefined && isOn) {
          values.push({
            id: 'speed',
            label: 'Speed',
            icon: 'Gauge',
            value: Math.round(speed),
            unit: '%',
            widgetType: 'value',
            isActive: true
          });
        }
      }
      
      return values;
    }
  },

  // Binary Sensor - Motion
  'binary_sensor_motion': {
    deviceType: 'sensor',
    displayName: 'Motion Sensor',
    icon: 'Activity',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const motion = entities.find(e => e.device_class === 'motion');
      if (motion) {
        const hasMotion = motion.state === 'on';
        values.push({
          id: 'motion',
          label: 'Motion',
          icon: 'Activity',
          value: hasMotion ? 'Detected' : 'Clear',
          widgetType: 'status',
          isActive: hasMotion
        });
      }
      return values;
    }
  },

  // Binary Sensor - Occupancy
  'binary_sensor_occupancy': {
    deviceType: 'sensor',
    displayName: 'Occupancy Sensor',
    icon: 'UserCheck',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const occupancy = entities.find(e => e.device_class === 'occupancy');
      if (occupancy) {
        const isOccupied = occupancy.state === 'on';
        values.push({
          id: 'occupancy',
          label: 'Status',
          icon: isOccupied ? 'UserCheck' : 'UserX',
          value: isOccupied ? 'Occupied' : 'Clear',
          widgetType: 'status',
          isActive: isOccupied
        });
      }
      return values;
    }
  },

  // Binary Sensor - Door
  'binary_sensor_door': {
    deviceType: 'sensor',
    displayName: 'Door Sensor',
    icon: 'DoorOpen',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const door = entities.find(e => e.device_class === 'door');
      if (door) {
        const isOpen = door.state === 'on';
        values.push({
          id: 'door',
          label: 'Status',
          icon: isOpen ? 'DoorOpen' : 'DoorClosed',
          value: isOpen ? 'Open' : 'Closed',
          widgetType: 'status',
          isActive: isOpen
        });
      }
      return values;
    }
  },

  // Binary Sensor - Window
  'binary_sensor_window': {
    deviceType: 'sensor',
    displayName: 'Window Sensor',
    icon: 'SquareStack',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const window = entities.find(e => e.device_class === 'window');
      if (window) {
        const isOpen = window.state === 'on';
        values.push({
          id: 'window',
          label: 'Status',
          icon: 'SquareStack',
          value: isOpen ? 'Open' : 'Closed',
          widgetType: 'status',
          isActive: isOpen
        });
      }
      return values;
    }
  },

  // Binary Sensor - Smoke
  'binary_sensor_smoke': {
    deviceType: 'sensor',
    displayName: 'Smoke Detector',
    icon: 'Flame',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const smoke = entities.find(e => e.device_class === 'smoke');
      if (smoke) {
        const detected = smoke.state === 'on';
        values.push({
          id: 'smoke',
          label: 'Status',
          icon: 'Flame',
          value: detected ? 'Detected!' : 'Clear',
          widgetType: 'status',
          isActive: detected
        });
      }
      return values;
    }
  },

  // Binary Sensor - Moisture
  'binary_sensor_moisture': {
    deviceType: 'sensor',
    displayName: 'Moisture Sensor',
    icon: 'Droplet',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const moisture = entities.find(e => e.device_class === 'moisture');
      if (moisture) {
        const isWet = moisture.state === 'on';
        values.push({
          id: 'moisture',
          label: 'Status',
          icon: 'Droplet',
          value: isWet ? 'Wet' : 'Dry',
          widgetType: 'status',
          isActive: isWet
        });
      }
      return values;
    }
  },

  // Sensor - Temperature
  'sensor_temperature': {
    deviceType: 'sensor',
    displayName: 'Temperature Sensor',
    icon: 'Thermometer',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const temp = entities.find(e => e.device_class === 'temperature');
      if (temp) {
        const tempValue = parseFloat(temp.state);
        values.push({
          id: 'temperature',
          label: 'Temperature',
          icon: 'Thermometer',
          value: formatValue(temp.state),
          unit: '°C',
          widgetType: 'value',
          isActive: !isNaN(tempValue)
        });
      }
      return values;
    }
  },

  // Sensor - Humidity
  'sensor_humidity': {
    deviceType: 'sensor',
    displayName: 'Humidity Sensor',
    icon: 'Droplets',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const humidity = entities.find(e => e.device_class === 'humidity');
      if (humidity) {
        values.push({
          id: 'humidity',
          label: 'Humidity',
          icon: 'Droplets',
          value: Math.round(parseFloat(humidity.state)),
          unit: '%',
          widgetType: 'value',
          isActive: true
        });
      }
      return values;
    }
  },

  // Sensor - Illuminance
  'sensor_illuminance': {
    deviceType: 'sensor',
    displayName: 'Light Sensor',
    icon: 'Sun',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const illuminance = entities.find(e => e.device_class === 'illuminance');
      if (illuminance) {
        const lux = parseFloat(illuminance.state);
        values.push({
          id: 'illuminance',
          label: 'Light Level',
          icon: 'Sun',
          value: Math.round(lux),
          unit: ' lx',
          widgetType: 'value',
          isActive: lux > 0
        });
      }
      return values;
    }
  },

  // Sensor - Battery
  'sensor_battery': {
    deviceType: 'sensor',
    displayName: 'Battery',
    icon: 'Battery',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const battery = entities.find(e => e.device_class === 'battery');
      if (battery) {
        const level = parseInt(battery.state);
        const icon = level < 20 ? 'BatteryLow' : level < 50 ? 'BatteryMedium' : 'BatteryFull';
        values.push({
          id: 'battery',
          label: 'Battery',
          icon,
          value: level,
          unit: '%',
          widgetType: 'value',
          isActive: level > 20
        });
      }
      return values;
    }
  },

  // Sensor - Power
  'sensor_power': {
    deviceType: 'sensor',
    displayName: 'Power Meter',
    icon: 'Zap',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const power = entities.find(e => e.device_class === 'power');
      if (power) {
        const watts = parseFloat(power.state);
        values.push({
          id: 'power',
          label: 'Power',
          icon: 'Zap',
          value: formatValue(power.state, 1),
          unit: ' W',
          widgetType: 'value',
          isActive: watts > 0
        });
      }
      return values;
    }
  },

  // Sensor - Energy
  'sensor_energy': {
    deviceType: 'sensor',
    displayName: 'Energy Meter',
    icon: 'Gauge',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const energy = entities.find(e => e.device_class === 'energy');
      if (energy) {
        values.push({
          id: 'energy',
          label: 'Energy',
          icon: 'Gauge',
          value: formatValue(energy.state, 2),
          unit: ' kWh',
          widgetType: 'value',
          isActive: true
        });
      }
      return values;
    }
  },

  // Sensor - PM2.5
  'sensor_pm25': {
    deviceType: 'sensor',
    displayName: 'Air Quality (PM2.5)',
    icon: 'Wind',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const pm25 = entities.find(e => e.device_class === 'pm25');
      if (pm25) {
        const value = parseInt(pm25.state);
        values.push({
          id: 'pm25',
          label: 'PM 2.5',
          icon: 'Wind',
          value,
          unit: ' µg/m³',
          widgetType: 'value',
          isActive: value < 35
        });
      }
      return values;
    }
  },

  // Sensor - PM10
  'sensor_pm10': {
    deviceType: 'sensor',
    displayName: 'Air Quality (PM10)',
    icon: 'Wind',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const pm10 = entities.find(e => e.device_class === 'pm10');
      if (pm10) {
        const value = parseInt(pm10.state);
        values.push({
          id: 'pm10',
          label: 'PM 10',
          icon: 'Wind',
          value,
          unit: ' µg/m³',
          widgetType: 'value',
          isActive: value < 50
        });
      }
      return values;
    }
  },

  // Sensor - CO2
  'sensor_carbon_dioxide': {
    deviceType: 'sensor',
    displayName: 'CO2 Sensor',
    icon: 'CloudOff',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const co2 = entities.find(e => e.device_class === 'carbon_dioxide');
      if (co2) {
        const ppm = parseInt(co2.state);
        values.push({
          id: 'co2',
          label: 'CO₂',
          icon: 'CloudOff',
          value: ppm,
          unit: ' ppm',
          widgetType: 'value',
          isActive: ppm < 1000
        });
      }
      return values;
    }
  },

  // Sensor - Pressure
  'sensor_pressure': {
    deviceType: 'sensor',
    displayName: 'Pressure Sensor',
    icon: 'Gauge',
    extractDisplayableValues: (entities) => {
      const values: DisplayableValue[] = [];
      const pressure = entities.find(e => e.device_class === 'pressure');
      if (pressure) {
        values.push({
          id: 'pressure',
          label: 'Pressure',
          icon: 'Gauge',
          value: formatValue(pressure.state, 1),
          unit: ' hPa',
          widgetType: 'value',
          isActive: true
        });
      }
      return values;
    }
  }
};

// Function to get template for a device
export const getDeviceTemplate = (
  deviceType: DeviceType, 
  manufacturer?: string,
  deviceClass?: string
): DeviceDisplayTemplate | null => {
  // Priority 1: Try device_class specific template (most specific)
  if (deviceClass) {
    const primaryDomain = deviceType === 'sensor' ? 'sensor' : 'binary_sensor';
    const classKey = `${primaryDomain}_${deviceClass}`;
    if (displayTemplates[classKey]) {
      return displayTemplates[classKey];
    }
  }

  // Priority 2: Try manufacturer-specific template
  if (manufacturer) {
    const key = `${deviceType}_${manufacturer.toLowerCase().replace(/\s+/g, '_')}`;
    if (displayTemplates[key]) {
      return displayTemplates[key];
    }
  }
  
  // Priority 3: Fall back to generic device type template
  if (displayTemplates[deviceType]) {
    return displayTemplates[deviceType];
  }
  
  return null;
};
