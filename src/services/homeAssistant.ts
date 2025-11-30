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
  };
}

class HomeAssistantService {
  private config: HomeAssistantConfig | null = null;
  private retryCount = 0;
  private maxRetries = 5;
  private baseRetryDelay = 1000; // Start with 1 second
  private _isConnected = false;

  setConfig(config: HomeAssistantConfig) {
    // Remove trailing slash from baseUrl to prevent double slashes
    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/+$/, '')
    };
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  setConnectionState(connected: boolean) {
    this._isConnected = connected;
  }

  private getHeaders() {
    if (!this.config) throw new Error("Home Assistant not configured");
    return {
      "Authorization": `Bearer ${this.config.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        // Reset retry count on success
        if (this.retryCount > 0) {
          console.log(`✅ ${operationName} succeeded after ${this.retryCount} retries`);
          this.retryCount = 0;
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        this.retryCount = attempt + 1;
        
        if (attempt < this.maxRetries) {
          // Calculate exponential backoff delay: 1s, 2s, 4s, 8s, 16s
          const delay = this.baseRetryDelay * Math.pow(2, attempt);
          console.warn(`⚠️  ${operationName} failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms...`);
          console.warn(`   Error: ${lastError.message}`);
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
      if (!this.config) {
        return { success: false, error: "No configuration provided" };
      }

      const response = await fetch(`${this.config.baseUrl}/api/`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        this._isConnected = false;
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      this._isConnected = true;
      return { success: true, version: data.version };
    } catch (error) {
      this._isConnected = false;
      return { success: false, error: (error as Error).message };
    }
  }

  async connectWithRetry(maxAttempts: number = 5): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30s
      
      try {
        const result = await this.testConnection();
        if (result.success) {
          console.log(`✅ Connected to Home Assistant (attempt ${attempt})`);
          return true;
        }
      } catch (error) {
        console.warn(`⚠️  Connection attempt ${attempt}/${maxAttempts} failed:`, error);
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.error(`❌ Failed to connect after ${maxAttempts} attempts`);
    return false;
  }

  async getLights(): Promise<HAEntity[]> {
    try {
      const response = await fetch(`${this.config?.baseUrl}/api/states`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const entities: HAEntity[] = await response.json();
      return entities.filter(e => e.entity_id.startsWith("light."));
    } catch (error) {
      console.error("Failed to get lights:", error);
      return [];
    }
  }

  async getSensors(): Promise<HAEntity[]> {
    try {
      const response = await fetch(`${this.config?.baseUrl}/api/states`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const entities: HAEntity[] = await response.json();
      return entities.filter(e => e.entity_id.startsWith("sensor."));
    } catch (error) {
      console.error("Failed to get sensors:", error);
      return [];
    }
  }

  async getEntityState(entityId: string): Promise<HAEntity | null> {
    try {
      const response = await fetch(`${this.config?.baseUrl}/api/states/${entityId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) return null;
      return await response.json();
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

      const response = await fetch(`${this.config?.baseUrl}/api/services/light/${service}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to set brightness: ${response.statusText}`);
      }
      
      return true;
    }, `setLightBrightness(${entityId}, ${brightnessPct}%)`).catch(error => {
      console.error("Failed to set light brightness:", error);
      return false;
    });
  }

  async getAllEntityStates(entityIds: string[]): Promise<Map<string, { state: string; brightness?: number }>> {
    // Fail fast - no retry logic, let reconnection loop handle failures
    const stateMap = new Map<string, { state: string; brightness?: number }>();
    
    await Promise.all(
      entityIds.map(async (entityId) => {
        try {
          const entity = await this.getEntityState(entityId);
          if (entity) {
            stateMap.set(entityId, {
              state: entity.state,
              brightness: entity.attributes.brightness,
            });
          }
        } catch (error) {
          // Skip individual entity errors, continue with others
          console.warn(`⚠️  Failed to fetch ${entityId}:`, error);
        }
      })
    );

    // If no states were returned, throw error
    if (stateMap.size === 0) {
      this._isConnected = false;
      throw new Error("No entity states returned from Home Assistant");
    }

    this._isConnected = true;
    return stateMap;
  }

  // Media Player Functions
  async getMediaPlayers(): Promise<MediaPlayerEntity[]> {
    try {
      const response = await fetch(`${this.config?.baseUrl}/api/states`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const entities: MediaPlayerEntity[] = await response.json();
      const mediaPlayers = entities.filter(e => e.entity_id.startsWith("media_player."));
      
      console.log('Found media players in HA:', mediaPlayers.map(e => e.entity_id));
      return mediaPlayers;
    } catch (error) {
      console.error("Failed to get media players:", error);
      return [];
    }
  }

  async getMediaPlayerState(entityId: string): Promise<MediaPlayerEntity | null> {
    try {
      const response = await fetch(`${this.config?.baseUrl}/api/states/${entityId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Failed to get media player state:", error);
      return null;
    }
  }

  async mediaPlayPause(entityId: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/media_play_pause`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ entity_id: entityId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to play/pause: ${response.statusText}`);
      }
      
      return true;
    }, `mediaPlayPause(${entityId})`).catch(error => {
      console.error("Failed to play/pause media player:", error);
      return false;
    });
  }

  async mediaNextTrack(entityId: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/media_next_track`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ entity_id: entityId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to skip to next track: ${response.statusText}`);
      }
      
      return true;
    }, `mediaNextTrack(${entityId})`).catch(error => {
      console.error("Failed to skip to next track:", error);
      return false;
    });
  }

  async mediaPreviousTrack(entityId: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/media_previous_track`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ entity_id: entityId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to skip to previous track: ${response.statusText}`);
      }
      
      return true;
    }, `mediaPreviousTrack(${entityId})`).catch(error => {
      console.error("Failed to skip to previous track:", error);
      return false;
    });
  }

  async setMediaVolume(entityId: string, volumeLevel: number): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/volume_set`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          entity_id: entityId,
          volume_level: volumeLevel 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set volume: ${response.statusText}`);
      }
      
      return true;
    }, `setMediaVolume(${entityId}, ${volumeLevel})`).catch(error => {
      console.error("Failed to set media volume:", error);
      return false;
    });
  }

  async toggleMediaMute(entityId: string, currentMuteState: boolean): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/volume_mute`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          entity_id: entityId,
          is_volume_muted: !currentMuteState
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle mute: ${response.statusText}`);
      }
      
      return true;
    }, `toggleMediaMute(${entityId})`).catch(error => {
      console.error("Failed to toggle mute:", error);
      return false;
    });
  }

  async mediaSeek(entityId: string, position: number): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/media_seek`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          entity_id: entityId,
          seek_position: position
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to seek: ${response.statusText}`);
      }

      return true;
    }, `mediaSeek(${entityId}, ${position})`).catch(error => {
      console.error("Failed to seek:", error);
      return false;
    });
  }

  getFullImageUrl(relativePath: string | null): string | null {
    if (!relativePath) return null;
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    return `${this.config?.baseUrl}${relativePath}`;
  }

  async setMediaShuffle(entityId: string, shuffle: boolean): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/shuffle_set`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          entity_id: entityId,
          shuffle 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set shuffle: ${response.statusText}`);
      }
      
      return true;
    }, `setMediaShuffle(${entityId}, ${shuffle})`).catch(error => {
      console.error("Failed to set shuffle:", error);
      return false;
    });
  }

  async setMediaRepeat(entityId: string, repeat: 'off' | 'one' | 'all'): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/repeat_set`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          entity_id: entityId,
          repeat 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set repeat: ${response.statusText}`);
      }
      
      return true;
    }, `setMediaRepeat(${entityId}, ${repeat})`).catch(error => {
      console.error("Failed to set repeat:", error);
      return false;
    });
  }

  async setMediaSource(entityId: string, source: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/select_source`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          entity_id: entityId,
          source 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set source: ${response.statusText}`);
      }
      
      return true;
    }, `setMediaSource(${entityId}, ${source})`).catch(error => {
      console.error("Failed to set source:", error);
      return false;
    });
  }

  async joinMediaPlayers(masterEntityId: string, groupMembers: string[]): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/join`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          entity_id: masterEntityId,
          group_members: groupMembers
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to join speakers: ${response.statusText}`);
      }
      
      return true;
    }, `joinMediaPlayers(${masterEntityId})`).catch(error => {
      console.error("Failed to join speakers:", error);
      return false;
    });
  }

  async unjoinMediaPlayer(entityId: string): Promise<boolean> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.config?.baseUrl}/api/services/media_player/unjoin`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ entity_id: entityId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to unjoin speaker: ${response.statusText}`);
      }
      
      return true;
    }, `unjoinMediaPlayer(${entityId})`).catch(error => {
      console.error("Failed to unjoin speaker:", error);
      return false;
    });
  }

  async getAvailableSpeakers(): Promise<MediaPlayerEntity[]> {
    const allPlayers = await this.getMediaPlayers();
    
    // Filter to only real speakers (Sonos, speakers, etc.) - exclude TV, Spotify entity, unavailable
    const speakers = allPlayers.filter(player => {
      const id = player.entity_id.toLowerCase();
      const name = (player.attributes.friendly_name || '').toLowerCase();
      
      // Include: Sonos, speakers, room names
      const isSpeaker = 
        id.includes('sonos') || 
        id.includes('speaker') ||
        id.includes('play') ||
        name.includes('sonos') ||
        name.includes('speaker') ||
        name.includes('play');
      
      // Exclude: Spotify entity, TV, unavailable states
      const isExcluded = 
        id.includes('spotify') || 
        id.includes('tv') ||
        player.state === 'unavailable';
      
      return isSpeaker && !isExcluded;
    });

    console.log('📻 Available speakers:', speakers.map(s => ({
      id: s.entity_id,
      name: s.attributes.friendly_name,
      state: s.state
    })));

    return speakers;
  }

  // Transfer Spotify playback to a specific Sonos speaker
  async transferPlaybackToSonos(spotifyEntityId: string, sonosEntityId: string, sonosName: string): Promise<boolean> {
    try {
      console.log(`🔄 Transferring playback to ${sonosName} (${sonosEntityId})`);
      
      // For Sonos + Spotify, we select the Sonos speaker in Spotify's source list
      // The speaker name should match what appears in Spotify's source_list
      const success = await this.setMediaSource(spotifyEntityId, sonosName);
      
      if (success) {
        console.log(`✅ Playback transferred to ${sonosName}`);
      }
      
      return success;
    } catch (error) {
      console.error(`Failed to transfer playback to ${sonosName}:`, error);
      return false;
    }
  }

  // Play on a speaker group
  async playOnSpeakerGroup(masterEntityId: string, memberEntityIds: string[], groupName: string): Promise<boolean> {
    try {
      console.log(`🔊 Creating speaker group: ${groupName}`, memberEntityIds);
      
      // Join all speakers to the master
      const success = await this.joinMediaPlayers(masterEntityId, memberEntityIds);
      
      if (success) {
        console.log(`✅ Speaker group created: ${groupName}`);
      }
      
      return success;
    } catch (error) {
      console.error(`Failed to create speaker group ${groupName}:`, error);
      return false;
    }
  }

  // Get actively playing speakers (those in a group)
  async getActiveSpeakers(entityId: string): Promise<string[]> {
    try {
      const state = await this.getMediaPlayerState(entityId);
      return state?.attributes.group_members || [];
    } catch (error) {
      console.error('Failed to get active speakers:', error);
      return [];
    }
  }
}

export const homeAssistant = new HomeAssistantService();
