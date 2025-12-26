import { haProxyClient } from './haProxyClient';

export interface HomeAssistantConfig {
  baseUrl: string;
  accessToken: string;
}

export interface EntityMapping {
  deskLamp?: string;
  monitorLight?: string;
  spotlight?: string;
  temperatureSensor?: string;
  humiditySensor?: string;
  airQualitySensor?: string;
  iphoneBatteryLevel?: string;
  iphoneBatteryState?: string;
  airpodsMaxBatteryLevel?: string;
  airpodsMaxBatteryState?: string;
  mediaPlayer?: string;
}

export interface MediaPlayerEntity {
  entity_id: string;
  state: 'playing' | 'paused' | 'idle' | 'off' | 'standby' | 'unavailable';
  attributes: {
    friendly_name?: string;
    volume_level?: number;
    is_volume_muted?: boolean;
    media_title?: string;
    media_artist?: string;
    media_album_name?: string;
    entity_picture?: string;
    media_duration?: number;
    media_position?: number;
    media_position_updated_at?: string;
    shuffle?: boolean;
    repeat?: 'off' | 'one' | 'all';
    source?: string;
    source_list?: string[];
    group_members?: string[];
    app_name?: string;
  };
}

export interface HAEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    brightness?: number;
    device_class?: string;
    unit_of_measurement?: string;
  };
  area_id?: string;
  area_name?: string;
  device_id?: string;
  device_name?: string;
}

export interface HAArea {
  area_id: string;
  name: string;
  icon?: string;
}

/**
 * Home Assistant Service - Uses Edge Function proxy with direct HTTP fallback
 * Tries proxy first (secure), falls back to direct calls when unauthenticated
 */
class HomeAssistantService {
  private config: HomeAssistantConfig | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private baseRetryDelay = 1000;

  setConfig(config: HomeAssistantConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/+$/, '')
    };
    // Also update the proxy client's direct config for fallback
    haProxyClient.setDirectConfig(this.config);
  }

  getConfig(): HomeAssistantConfig | null {
    return this.config;
  }

  // Test connection with direct HTTP (bypasses proxy, for Settings page testing)
  async testDirectConnection(baseUrl: string, accessToken: string): Promise<{ success: boolean; version?: string; error?: string }> {
    return haProxyClient.testDirectConnection({ baseUrl, accessToken });
  }


  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        if (this.retryCount > 0) {
          console.log(`✅ ${operationName} succeeded after ${this.retryCount} retries`);
          this.retryCount = 0;
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        this.retryCount = attempt + 1;
        
        if (attempt < this.maxRetries) {
          const delay = this.baseRetryDelay * Math.pow(2, attempt);
          console.warn(`⚠️ ${operationName} failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`❌ ${operationName} failed after ${this.maxRetries + 1} attempts`);
    throw lastError;
  }

  resetRetryCount() {
    this.retryCount = 0;
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  async testConnection(): Promise<{ success: boolean; version?: string; error?: string }> {
    try {
      const { data, error } = await haProxyClient.get<{ version: string }>('/api/');
      
      if (error) {
        console.error('❌ HA connection failed', error);
        return { success: false, error };
      }
      
      console.log('✅ HA connection successful', { version: data?.version });
      return { success: true, version: data?.version };
    } catch (error) {
      const message = (error as Error).message;
      console.error('❌ HA connection failed', message);
      return { success: false, error: message };
    }
  }

  async getLights(): Promise<HAEntity[]> {
    try {
      const { data, error } = await haProxyClient.get<HAEntity[]>('/api/states');
      if (error || !data) return [];
      return data.filter(e => e.entity_id.startsWith("light."));
    } catch (error) {
      console.error("Failed to get lights:", error);
      return [];
    }
  }

  async getSensors(): Promise<HAEntity[]> {
    try {
      const { data, error } = await haProxyClient.get<HAEntity[]>('/api/states');
      if (error || !data) return [];
      return data.filter(e => e.entity_id.startsWith("sensor."));
    } catch (error) {
      console.error("Failed to get sensors:", error);
      return [];
    }
  }

  async getAreas(): Promise<HAArea[]> {
    try {
      const { data, error } = await haProxyClient.get<HAArea[]>('/api/config/area_registry/list');
      if (error || !data) return [];
      return data;
    } catch (error) {
      console.error("Failed to get areas:", error);
      return [];
    }
  }

  async getEntitiesWithContext(): Promise<HAEntity[]> {
    try {
      const [statesRes, areasRes, devicesRes, entityRegistryRes] = await Promise.all([
        haProxyClient.get<HAEntity[]>('/api/states'),
        haProxyClient.get<any[]>('/api/config/area_registry/list'),
        haProxyClient.get<any[]>('/api/config/device_registry/list'),
        haProxyClient.get<any[]>('/api/config/entity_registry/list')
      ]);

      const states = statesRes.data || [];
      const areas = areasRes.data || [];
      const devices = devicesRes.data || [];
      const entityRegistry = entityRegistryRes.data || [];

      const areaMap = new Map<string, string>(areas.map((a: any) => [a.area_id, a.name]));
      const deviceMap = new Map<string, { name: string; area_id?: string }>(
        devices.map((d: any) => [d.id, { name: d.name_by_user || d.name, area_id: d.area_id }])
      );
      const entityMap = new Map<string, { device_id?: string; area_id?: string }>(
        entityRegistry.map((e: any) => [e.entity_id, { device_id: e.device_id, area_id: e.area_id }])
      );

      return states.map((entity: HAEntity) => {
        const entityInfo = entityMap.get(entity.entity_id);
        const deviceInfo = entityInfo?.device_id ? deviceMap.get(entityInfo.device_id) : null;
        const areaId = entityInfo?.area_id || deviceInfo?.area_id;
        
        return {
          ...entity,
          area_id: areaId,
          area_name: areaId ? areaMap.get(areaId) : undefined,
          device_id: entityInfo?.device_id,
          device_name: deviceInfo?.name
        };
      });
    } catch (error) {
      console.error("Failed to get entities with context:", error);
      return [];
    }
  }

  async getEntityState(entityId: string): Promise<HAEntity | null> {
    try {
      const { data, error } = await haProxyClient.get<HAEntity>(`/api/states/${entityId}`);
      if (error || !data) return null;
      return data;
    } catch (error) {
      console.error("Failed to get entity state:", error);
      return null;
    }
  }

  async setLightBrightness(entityId: string, brightnessPct: number): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const service = brightnessPct === 0 ? "turn_off" : "turn_on";
      const body: any = { entity_id: entityId };
      
      if (brightnessPct > 0) {
        body.brightness_pct = brightnessPct;
      }

      const { error } = await haProxyClient.post(`/api/services/light/${service}`, body);
      
      if (error) {
        throw new Error(`Failed to set brightness: ${error}`);
      }
      
      return true;
    }, `setLightBrightness(${entityId}, ${brightnessPct}%)`).catch(error => {
      console.error("Failed to set light brightness:", error);
      return false;
    });
  }

  async getAllEntityStates(entityIds: string[]): Promise<Map<string, { state: string; brightness?: number }>> {
    return this.retryWithBackoff(async () => {
      const stateMap = new Map<string, { state: string; brightness?: number }>();
      
      await Promise.all(
        entityIds.map(async (entityId) => {
          const entity = await this.getEntityState(entityId);
          if (entity) {
            stateMap.set(entityId, {
              state: entity.state,
              brightness: entity.attributes.brightness,
            });
          }
        })
      );

      if (stateMap.size === 0) {
        throw new Error("No entity states returned from Home Assistant");
      }

      return stateMap;
    }, "getAllEntityStates");
  }

  // Media Player Functions
  async getMediaPlayers(): Promise<MediaPlayerEntity[]> {
    try {
      const { data, error } = await haProxyClient.get<MediaPlayerEntity[]>('/api/states');
      if (error || !data) return [];
      
      const mediaPlayers = data.filter(e => e.entity_id.startsWith("media_player."));
      console.log('Found media players in HA:', mediaPlayers.map(e => e.entity_id));
      return mediaPlayers;
    } catch (error) {
      console.error("Failed to get media players:", error);
      return [];
    }
  }

  async getMediaPlayerState(entityId: string): Promise<MediaPlayerEntity | null> {
    try {
      const { data, error } = await haProxyClient.get<MediaPlayerEntity>(`/api/states/${entityId}`);
      if (error || !data) return null;
      return data;
    } catch (error) {
      console.error("Failed to get media player state:", error);
      return null;
    }
  }

  async mediaPlayPause(entityId: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const { error } = await haProxyClient.post('/api/services/media_player/media_play_pause', { 
        entity_id: entityId 
      });
      if (error) throw new Error(`Failed to play/pause: ${error}`);
      return true;
    }, `mediaPlayPause(${entityId})`).catch(error => {
      console.error("Failed to play/pause media player:", error);
      return false;
    });
  }

  async mediaNextTrack(entityId: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const { error } = await haProxyClient.post('/api/services/media_player/media_next_track', { 
        entity_id: entityId 
      });
      if (error) throw new Error(`Failed to skip to next track: ${error}`);
      return true;
    }, `mediaNextTrack(${entityId})`).catch(error => {
      console.error("Failed to skip to next track:", error);
      return false;
    });
  }

  async mediaPreviousTrack(entityId: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const { error } = await haProxyClient.post('/api/services/media_player/media_previous_track', { 
        entity_id: entityId 
      });
      if (error) throw new Error(`Failed to skip to previous track: ${error}`);
      return true;
    }, `mediaPreviousTrack(${entityId})`).catch(error => {
      console.error("Failed to skip to previous track:", error);
      return false;
    });
  }

  async setMediaVolume(entityId: string, volumeLevel: number): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const { error } = await haProxyClient.post('/api/services/media_player/volume_set', { 
        entity_id: entityId,
        volume_level: volumeLevel 
      });
      if (error) throw new Error(`Failed to set volume: ${error}`);
      return true;
    }, `setMediaVolume(${entityId}, ${volumeLevel})`).catch(error => {
      console.error("Failed to set media volume:", error);
      return false;
    });
  }

  async toggleMediaMute(entityId: string, currentMuteState: boolean): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const { error } = await haProxyClient.post('/api/services/media_player/volume_mute', { 
        entity_id: entityId,
        is_volume_muted: !currentMuteState
      });
      if (error) throw new Error(`Failed to toggle mute: ${error}`);
      return true;
    }, `toggleMediaMute(${entityId})`).catch(error => {
      console.error("Failed to toggle mute:", error);
      return false;
    });
  }

  async mediaSeek(entityId: string, position: number): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const { error } = await haProxyClient.post('/api/services/media_player/media_seek', {
        entity_id: entityId,
        seek_position: position
      });
      if (error) throw new Error(`Failed to seek: ${error}`);
      return true;
    }, `mediaSeek(${entityId}, ${position})`).catch(error => {
      console.error("Failed to seek:", error);
      return false;
    });
  }

  async setShuffle(entityId: string, shuffle: boolean): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const { error } = await haProxyClient.post('/api/services/media_player/shuffle_set', {
        entity_id: entityId,
        shuffle: shuffle
      });
      if (error) throw new Error(`Failed to set shuffle: ${error}`);
      return true;
    }, `setShuffle(${entityId}, ${shuffle})`).catch(error => {
      console.error("Failed to set shuffle:", error);
      return false;
    });
  }

  async setRepeat(entityId: string, repeat: 'off' | 'one' | 'all'): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const { error } = await haProxyClient.post('/api/services/media_player/repeat_set', {
        entity_id: entityId,
        repeat: repeat
      });
      if (error) throw new Error(`Failed to set repeat: ${error}`);
      return true;
    }, `setRepeat(${entityId}, ${repeat})`).catch(error => {
      console.error("Failed to set repeat:", error);
      return false;
    });
  }

  async selectSource(entityId: string, source: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const { error } = await haProxyClient.post('/api/services/media_player/select_source', {
        entity_id: entityId,
        source: source
      });
      if (error) throw new Error(`Failed to select source: ${error}`);
      return true;
    }, `selectSource(${entityId}, ${source})`).catch(error => {
      console.error("Failed to select source:", error);
      return false;
    });
  }

  // Image cache for album art
  private imageCache = new Map<string, string>();

  clearImageCache() {
    this.imageCache.clear();
  }

  // Image handling - proxy through edge function
  getFullImageUrl(relativePath: string | null): string | null {
    if (!relativePath) return null;
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    if (!this.config?.baseUrl) return null;
    return `${this.config.baseUrl}${relativePath}`;
  }

  async fetchImageAsDataUrl(relativePath: string | null): Promise<string | null> {
    if (!relativePath) return null;

    // Check cache first
    if (this.imageCache.has(relativePath)) {
      return this.imageCache.get(relativePath)!;
    }

    try {
      const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
      const { data, error } = await haProxyClient.getImage(path);

      if (error || !data) {
        console.warn('[HA] Failed to fetch image via proxy:', error);
        return null;
      }

      // Cache the result
      this.imageCache.set(relativePath, data);
      return data;
    } catch (error) {
      console.error('[HA] Failed to fetch image:', error);
      return null;
    }
  }

  // For album art - return the relative path for the proxy to handle
  getProxyImagePath(relativePath: string | null): string | null {
    if (!relativePath) return null;
    return relativePath;
  }
}

export const homeAssistant = new HomeAssistantService();
