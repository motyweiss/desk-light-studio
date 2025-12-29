import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { homeAssistant, type EntityMapping } from '@/services/homeAssistant';
import { haProxyClient } from '@/services/haProxyClient';
import { connectionManager, type ConnectionState, type ConnectionMode } from '@/services/ConnectionManager';
import { DevicesMapping, DeviceConfig, RoomConfig } from '@/types/settings';
import { logger } from '@/shared/utils/logger';

// ============= Types =============
interface HAConfig {
  baseUrl: string;
  accessToken: string;
}

interface ConnectionResult {
  success: boolean;
  version?: string;
  error?: string;
}

interface HAConnectionContextValue {
  // State
  config: HAConfig | null;
  entityMapping: EntityMapping;
  devicesMapping: DevicesMapping;
  isConnected: boolean;
  isLoading: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  connectionMode: ConnectionMode;
  haVersion: string | null;
  error: string | null;

  // Actions
  saveConfig: (baseUrl: string, accessToken: string) => Promise<{ success: boolean; error?: string }>;
  saveDevicesMapping: (mapping: DevicesMapping) => Promise<{ success: boolean; error?: string }>;
  testConnection: (baseUrl: string, accessToken: string) => Promise<ConnectionResult>;
  reconnect: () => Promise<void>;
  markSuccessfulSync: () => void;
}

// ============= Default Entity Mapping =============
const DEFAULT_ENTITY_MAPPING: EntityMapping = {
  deskLamp: 'light.go',
  monitorLight: 'light.screen',
  spotlight: 'light.door',
  temperatureSensor: 'sensor.dyson_pure_temperature',
  humiditySensor: 'sensor.dyson_pure_humidity',
  airQualitySensor: 'sensor.dyson_pure_pm_2_5',
  iphoneBatteryLevel: 'sensor.moty_s_iphone_battery_level',
  iphoneBatteryState: 'sensor.moty_s_iphone_battery_state',
  mediaPlayer: 'media_player.spotify',
};

const DEFAULT_DEVICES_MAPPING: DevicesMapping = {
  rooms: [{
    id: 'office',
    name: 'Office',
    lights: [
      { id: 'desk_lamp', label: 'Desk Lamp', entity_id: 'light.go' },
      { id: 'monitor_light', label: 'Monitor Light', entity_id: 'light.screen' },
      { id: 'spotlight', label: 'Spotlight', entity_id: 'light.door' },
    ],
    sensors: [
      { id: 'temperature', label: 'Temperature', entity_id: 'sensor.dyson_pure_temperature', type: 'temperature' },
      { id: 'humidity', label: 'Humidity', entity_id: 'sensor.dyson_pure_humidity', type: 'humidity' },
      { id: 'air_quality', label: 'Air Quality', entity_id: 'sensor.dyson_pure_pm_2_5', type: 'air_quality' },
    ],
    mediaPlayers: [
      { id: 'spotify', label: 'Spotify', entity_id: 'media_player.spotify' },
    ],
  }]
};

// ============= Helper Functions =============
const convertToLegacyFormat = (devicesMapping: DevicesMapping): EntityMapping => {
  const office = devicesMapping.rooms[0];
  if (!office) return DEFAULT_ENTITY_MAPPING;
  
  // Find battery sensors from devices mapping
  const batterySensors = office.sensors.filter(s => s.type === 'battery');
  const iphoneBatterySensor = batterySensors.find(s => 
    s.entity_id.toLowerCase().includes('iphone') || 
    s.label.toLowerCase().includes('iphone')
  );
  const airpodsBatterySensor = batterySensors.find(s => 
    s.entity_id.toLowerCase().includes('airpods') || 
    s.label.toLowerCase().includes('airpods')
  );
  
  return {
    deskLamp: office.lights.find(l => l.id === 'desk_lamp')?.entity_id || 'light.go',
    monitorLight: office.lights.find(l => l.id === 'monitor_light')?.entity_id || 'light.screen',
    spotlight: office.lights.find(l => l.id === 'spotlight')?.entity_id || 'light.door',
    temperatureSensor: office.sensors.find(s => s.type === 'temperature')?.entity_id || 'sensor.dyson_pure_temperature',
    humiditySensor: office.sensors.find(s => s.type === 'humidity')?.entity_id || 'sensor.dyson_pure_humidity',
    airQualitySensor: office.sensors.find(s => s.type === 'air_quality')?.entity_id || 'sensor.dyson_pure_pm_2_5',
    iphoneBatteryLevel: iphoneBatterySensor?.entity_id || DEFAULT_ENTITY_MAPPING.iphoneBatteryLevel,
    iphoneBatteryState: iphoneBatterySensor ? iphoneBatterySensor.entity_id.replace('_battery_level', '_battery_state').replace('_level', '_state') : DEFAULT_ENTITY_MAPPING.iphoneBatteryState,
    airpodsMaxBatteryLevel: airpodsBatterySensor?.entity_id,
    airpodsMaxBatteryState: airpodsBatterySensor ? airpodsBatterySensor.entity_id.replace('_battery_level', '_battery_state').replace('_level', '_state') : undefined,
    mediaPlayer: office.mediaPlayers[0]?.entity_id || 'media_player.spotify',
  };
};

// ============= Context =============
const HAConnectionContext = createContext<HAConnectionContextValue | null>(null);

export const useHAConnection = () => {
  const context = useContext(HAConnectionContext);
  if (!context) {
    // Return a safe default instead of throwing - allows components to render during initialization
    return {
      config: null,
      entityMapping: DEFAULT_ENTITY_MAPPING,
      devicesMapping: DEFAULT_DEVICES_MAPPING,
      isConnected: false,
      isLoading: true,
      connectionStatus: 'disconnected' as const,
      connectionMode: 'none' as ConnectionMode,
      haVersion: null,
      error: null,
      saveConfig: async () => ({ success: false, error: 'Provider not ready' }),
      saveDevicesMapping: async () => ({ success: false, error: 'Provider not ready' }),
      testConnection: async () => ({ success: false, error: 'Provider not ready' }),
      reconnect: async () => {},
      markSuccessfulSync: () => {},
    };
  }
  return context;
};

// ============= Provider =============
export const HAConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // State
  const [config, setConfig] = useState<HAConfig | null>(null);
  const [devicesMapping, setDevicesMapping] = useState<DevicesMapping>(DEFAULT_DEVICES_MAPPING);
  const [entityMapping, setEntityMapping] = useState<EntityMapping>(DEFAULT_ENTITY_MAPPING);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('none');
  const [haVersion, setHaVersion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConnected = connectionStatus === 'connected';
  const configuredRef = useRef(false);

  // ============= Subscribe to ConnectionManager =============
  useEffect(() => {
    const unsubscribe = connectionManager.subscribe((state: ConnectionState, mode: ConnectionMode) => {
      // Map ConnectionManager state to context state
      if (state === 'reconnecting') {
        setConnectionStatus('connecting');
      } else if (state === 'connected') {
        setConnectionStatus('connected');
        setError(null);
      } else if (state === 'connecting') {
        setConnectionStatus('connecting');
      } else {
        setConnectionStatus('disconnected');
      }
      setConnectionMode(mode);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ============= Configure HA Clients =============
  const configureClients = useCallback((haConfig: HAConfig) => {
    const configObj = {
      baseUrl: haConfig.baseUrl.replace(/\/+$/, ''),
      accessToken: haConfig.accessToken,
    };
    
    // Configure homeAssistant service (which internally sets haProxyClient.setDirectConfig)
    homeAssistant.setConfig(configObj);
    // Also set haProxyClient directly for redundancy
    haProxyClient.setDirectConfig(configObj);
    
    logger.connection('All HA clients configured', { baseUrl: configObj.baseUrl });
  }, []);

  // ============= Test Connection =============
  const testConnection = useCallback(async (baseUrl: string, accessToken: string): Promise<ConnectionResult> => {
    try {
      const cleanUrl = baseUrl.replace(/\/+$/, '');
      
      // Use direct connection test first (more reliable for testing)
      const directResult = await homeAssistant.testDirectConnection(cleanUrl, accessToken);
      
      if (directResult.success) {
        // If direct connection works, configure the clients
        const tempConfig = { baseUrl: cleanUrl, accessToken };
        homeAssistant.setConfig(tempConfig);
        haProxyClient.setDirectConfig(tempConfig);
      }
      
      return directResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      return { success: false, error: message };
    }
  }, []);

  // ============= Load Config =============
  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    logger.connection('Loading HA config...');

    try {
      let haConfig: HAConfig | null = null;
      let loadedDevicesMapping: DevicesMapping | null = null;

      if (user) {
        // Load from database when authenticated
        const { data: configData, error: configError } = await supabase
          .from('user_ha_configs')
          .select('base_url, access_token')
          .eq('user_id', user.id)
          .maybeSingle();

        if (configError) {
          logger.error('Error loading HA config', configError);
          setError(configError.message);
          setIsLoading(false);
          return;
        }

        if (configData) {
          haConfig = {
            baseUrl: configData.base_url,
            accessToken: configData.access_token,
          };
        }

        // Load devices mapping from database
        const { data: devicesData, error: devicesError } = await supabase
          .from('user_ha_devices')
          .select('devices_mapping')
          .eq('user_id', user.id)
          .maybeSingle();

        if (devicesError && devicesError.code !== 'PGRST116') {
          logger.error('Error loading devices mapping', devicesError);
        }

        if (devicesData?.devices_mapping) {
          loadedDevicesMapping = devicesData.devices_mapping as unknown as DevicesMapping;
        }
      } else {
        // No user - config will be loaded when user authenticates
        logger.connection('No authenticated user, skipping HA config load');
        setIsLoading(false);
        return;
      }

      // Apply devices mapping
      if (loadedDevicesMapping) {
        setDevicesMapping(loadedDevicesMapping);
        setEntityMapping(convertToLegacyFormat(loadedDevicesMapping));
        logger.connection('Loaded devices mapping');
      } else {
        setDevicesMapping(DEFAULT_DEVICES_MAPPING);
        setEntityMapping(DEFAULT_ENTITY_MAPPING);
      }

      // Configure and connect if we have config
      if (haConfig) {
        setConfig(haConfig);
        
        // CRITICAL: Configure clients FIRST before any connection attempts
        logger.connection('Configuring HA clients before connection...');
        configureClients(haConfig);
        
        // Verify config was set
        const configCheck = haProxyClient.getDirectConfig();
        logger.connection('haProxyClient config verification:', { 
          hasConfig: !!configCheck,
          baseUrl: configCheck?.baseUrl 
        });

        // Use ConnectionManager for connection
        const success = await connectionManager.connect(haConfig);
        
        if (success) {
          // Get version from direct test
          const result = await homeAssistant.testConnection();
          setHaVersion(result.version || null);
          logger.connection('Connected to Home Assistant', { version: result.version });
        } else {
          setError('Connection failed');
          logger.error('HA connection failed');
        }
      } else {
        setConnectionStatus('disconnected');
        logger.connection('No HA config found');
      }

    } catch (err) {
      logger.error('Exception loading config', err);
      setError(err instanceof Error ? err.message : 'Failed to load config');
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [user, configureClients]);

  // ============= Save Config =============
  const saveConfig = useCallback(async (baseUrl: string, accessToken: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
      const newConfig: HAConfig = { baseUrl: cleanBaseUrl, accessToken };

      if (user) {
        // Save to database when authenticated
        const { error: upsertError } = await supabase
          .from('user_ha_configs')
          .upsert({
            user_id: user.id,
            base_url: cleanBaseUrl,
            access_token: accessToken,
          }, {
            onConflict: 'user_id',
          });

        if (upsertError) {
          logger.error('Error saving HA config', upsertError);
          return { success: false, error: upsertError.message };
        }
      } else {
        // No user - cannot save config
        logger.error('Cannot save HA config: no authenticated user');
        return { success: false, error: 'Please sign in to save settings' };
      }

      // Update local state
      setConfig(newConfig);
      configureClients(newConfig);

      // Connect using ConnectionManager
      const success = await connectionManager.connect(newConfig);
      
      if (success) {
        const result = await homeAssistant.testConnection();
        setHaVersion(result.version || null);
        logger.connection('Saved config and connected', { version: result.version });
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save config';
      return { success: false, error: message };
    }
  }, [user, configureClients]);

  // ============= Save Devices Mapping =============
  const saveDevicesMapping = useCallback(async (mapping: DevicesMapping): Promise<{ success: boolean; error?: string }> => {
    try {
      if (user) {
        // Save to database when authenticated
        const { error: upsertError } = await supabase
          .from('user_ha_devices')
          .upsert({
            user_id: user.id,
            devices_mapping: mapping as any,
          }, {
            onConflict: 'user_id',
          });

        if (upsertError) {
          logger.error('Error saving devices mapping', upsertError);
          return { success: false, error: upsertError.message };
        }
      } else {
        // No user - cannot save devices
        logger.error('Cannot save devices: no authenticated user');
        return { success: false, error: 'Please sign in to save settings' };
      }

      // Update local state
      setDevicesMapping(mapping);
      setEntityMapping(convertToLegacyFormat(mapping));
      
      logger.connection('Saved devices mapping');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save devices';
      return { success: false, error: message };
    }
  }, [user]);

  // ============= Reconnect =============
  const reconnect = useCallback(async () => {
    if (!config) return;

    logger.connection('Attempting reconnection via ConnectionManager...');
    
    configureClients(config);
    await connectionManager.reconnect();
  }, [config, configureClients]);

  // ============= Mark Successful Sync =============
  const markSuccessfulSync = useCallback(() => {
    connectionManager.markSuccessfulSync();
  }, []);

  // ============= Load config when user changes =============
  useEffect(() => {
    // Reset configured ref when user changes
    if (user) {
      logger.connection('User authenticated, loading HA config...');
      loadConfig();
    } else {
      // User logged out - clear config
      logger.connection('User logged out, clearing HA config');
      setConfig(null);
      setDevicesMapping(DEFAULT_DEVICES_MAPPING);
      setEntityMapping(DEFAULT_ENTITY_MAPPING);
      setConnectionStatus('disconnected');
      setHaVersion(null);
      haProxyClient.setDirectConfig(null);
      connectionManager.disconnect();
      setIsLoading(false);
    }
  }, [user, loadConfig]);

  // ============= Context Value =============
  const value: HAConnectionContextValue = {
    config,
    entityMapping,
    devicesMapping,
    isConnected,
    isLoading,
    connectionStatus,
    connectionMode,
    haVersion,
    error,
    saveConfig,
    saveDevicesMapping,
    testConnection,
    reconnect,
    markSuccessfulSync,
  };

  return (
    <HAConnectionContext.Provider value={value}>
      {children}
    </HAConnectionContext.Provider>
  );
};
