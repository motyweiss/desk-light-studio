// Entity filtering rules for smart device discovery

export const DISPLAYABLE_DOMAINS = [
  'light',
  'climate',
  'media_player',
  'cover',
  'fan',
  'vacuum',
  'lock',
  'camera',
  'switch',
  'sensor',
  'binary_sensor',
];

export const EXCLUDED_PATTERNS = [
  'automation.*',
  'script.*',
  'scene.*',
  'update.*',
  'person.*',
  'zone.*',
  'sun.*',
  'input_*',
  'timer.*',
  'schedule.*',
  'group.*',
  'button.*',
  'weather.*',
  '*.timers',
  '*.uptime',
  '*.availability',
  '*.debug',
  '*.rssi',
  '*.linkquality',
  '*.last_seen',
  '*battery_type*',
  '*_firmware*',
  '*_hardware*',
  '*_serial*',
  '*_model*',
  'sensor.sun_*',
];

export const RELEVANT_SENSOR_CLASSES = [
  'temperature',
  'humidity',
  'pm25',
  'pm10',
  'battery',
  'power',
  'energy',
  'illuminance',
  'motion',
  'occupancy',
  'door',
  'window',
  'pressure',
  'aqi',
  'carbon_dioxide',
];

export const RELEVANT_BINARY_SENSOR_CLASSES = [
  'motion',
  'occupancy',
  'door',
  'window',
  'opening',
  'presence',
  'smoke',
  'gas',
  'moisture',
  'battery',
];

// Check if entity should be included in discovery
export function shouldIncludeEntity(entityId: string, domain: string, state: string, deviceClass?: string): boolean {
  // Exclude unavailable entities
  if (state === 'unavailable' || state === 'unknown') {
    return false;
  }

  // Check excluded patterns
  for (const pattern of EXCLUDED_PATTERNS) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    if (regex.test(entityId)) {
      return false;
    }
  }

  // Check if domain is displayable
  if (!DISPLAYABLE_DOMAINS.includes(domain)) {
    return false;
  }

  // For sensors, check device class
  if (domain === 'sensor') {
    return !deviceClass || RELEVANT_SENSOR_CLASSES.includes(deviceClass);
  }

  // For binary sensors, check device class
  if (domain === 'binary_sensor') {
    return !deviceClass || RELEVANT_BINARY_SENSOR_CLASSES.includes(deviceClass);
  }

  return true;
}

// Detect manufacturer from entity or device name
export const MANUFACTURERS = [
  { name: 'Dyson', patterns: ['dyson'], icon: 'dyson' },
  { name: 'Philips Hue', patterns: ['hue', 'philips'], icon: 'hue' },
  { name: 'Apple', patterns: ['iphone', 'ipad', 'airpods', 'macbook', 'homepod', 'apple'], icon: 'apple' },
  { name: 'Sonos', patterns: ['sonos'], icon: 'sonos' },
  { name: 'Spotify', patterns: ['spotify'], icon: 'spotify' },
  { name: 'Google', patterns: ['nest', 'google home', 'chromecast'], icon: 'google' },
  { name: 'Amazon', patterns: ['echo', 'alexa', 'fire'], icon: 'amazon' },
  { name: 'Samsung', patterns: ['samsung', 'smartthings'], icon: 'samsung' },
  { name: 'IKEA', patterns: ['ikea', 'tradfri'], icon: 'ikea' },
  { name: 'Xiaomi', patterns: ['xiaomi', 'mi ', 'roborock'], icon: 'xiaomi' },
  { name: 'Shelly', patterns: ['shelly'], icon: 'shelly' },
  { name: 'TP-Link', patterns: ['tp-link', 'tapo', 'kasa'], icon: 'tplink' },
];

export function detectManufacturer(name: string): string | undefined {
  const lowerName = name.toLowerCase();
  for (const mfr of MANUFACTURERS) {
    if (mfr.patterns.some(pattern => lowerName.includes(pattern))) {
      return mfr.name;
    }
  }
  return undefined;
}
