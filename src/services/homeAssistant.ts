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

  setConfig(config: HomeAssistantConfig) {
    // Remove trailing slash from baseUrl to prevent double slashes
    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/+$/, '')
    };
  }

  private getHeaders() {
    if (!this.config) throw new Error("Home Assistant not configured");
    return {
      "Authorization": `Bearer ${this.config.accessToken}`,
      "Content-Type": "application/json",
    };
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
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, version: data.version };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
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
    try {
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

      return response.ok;
    } catch (error) {
      console.error("Failed to set light brightness:", error);
      return false;
    }
  }

  async getAllEntityStates(entityIds: string[]): Promise<Map<string, { state: string; brightness?: number }>> {
    const stateMap = new Map<string, { state: string; brightness?: number }>();
    
    try {
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
    } catch (error) {
      console.error("Failed to get all entity states:", error);
    }

    return stateMap;
  }
}

export const homeAssistant = new HomeAssistantService();
