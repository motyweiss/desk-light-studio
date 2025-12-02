import { logger } from '@/shared/utils/logger';
import type { HAConfig, HAEntity, ConnectionResult } from './types';

/**
 * HTTP Client for Home Assistant API
 * 
 * Handles all REST API calls with:
 * - Automatic retry with exponential backoff
 * - Error handling and logging
 * - Type-safe requests and responses
 * 
 * @example
 * ```typescript
 * haClient.setConfig({ baseUrl: '...', accessToken: '...' });
 * const entity = await haClient.getEntityState('light.desk_lamp');
 * ```
 */
class HomeAssistantClient {
  private config: HAConfig | null = null;
  private retryConfig = {
    maxRetries: 5,
    baseDelay: 1000,
  };

  /**
   * Set Home Assistant configuration
   */
  setConfig(config: HAConfig): void {
    this.config = config;
    logger.connection('HA client configured', { baseUrl: config.baseUrl });
  }

  /**
   * Get current configuration
   */
  getConfig(): HAConfig | null {
    return this.config;
  }

  /**
   * Test connection to Home Assistant
   */
  async testConnection(config?: HAConfig): Promise<ConnectionResult> {
    const testConfig = config || this.config;
    
    if (!testConfig) {
      return {
        success: false,
        message: 'No configuration provided',
      };
    }

    try {
      const response = await this.request<{ message: string; version?: string }>(
        '/api/',
        { method: 'GET' },
        testConfig
      );

      logger.connection('Connection test successful', response);
      
      return {
        success: true,
        message: 'Connected successfully',
        version: response.version,
      };
    } catch (error) {
      logger.error('Connection test failed', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Get entity state
   */
  async getEntityState(entityId: string): Promise<HAEntity | null> {
    if (!this.config) {
      throw new Error('Client not configured');
    }

    try {
      const entity = await this.request<HAEntity>(
        `/api/states/${entityId}`,
        { method: 'GET' }
      );

      return entity;
    } catch (error) {
      logger.error(`Failed to get state for ${entityId}`, error);
      return null;
    }
  }

  /**
   * Get all entity states
   */
  async getAllStates(): Promise<HAEntity[]> {
    if (!this.config) {
      throw new Error('Client not configured');
    }

    try {
      const entities = await this.request<HAEntity[]>(
        '/api/states',
        { method: 'GET' }
      );

      return entities;
    } catch (error) {
      logger.error('Failed to get all states', error);
      return [];
    }
  }

  /**
   * Call a service
   */
  async callService(
    domain: string,
    service: string,
    serviceData?: Record<string, any>
  ): Promise<HAEntity[]> {
    if (!this.config) {
      throw new Error('Client not configured');
    }

    try {
      const result = await this.request<HAEntity[]>(
        `/api/services/${domain}/${service}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData || {}),
        }
      );

      logger.sync(`Service called: ${domain}.${service}`, serviceData);
      return result;
    } catch (error) {
      logger.error(`Service call failed: ${domain}.${service}`, error);
      throw error;
    }
  }

  /**
   * Get historical data for an entity
   */
  async getHistory(
    entityId: string,
    hoursBack: number = 24
  ): Promise<Array<{ state: string; last_changed: string }>> {
    if (!this.config) {
      throw new Error('Client not configured');
    }

    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - hoursBack * 60 * 60 * 1000);
      
      const response = await this.request<Array<Array<{ state: string; last_changed: string }>>>(
        `/api/history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&minimal_response&significant_changes_only`,
        { method: 'GET' }
      );

      return response[0] || [];
    } catch (error) {
      logger.error(`Failed to get history for ${entityId}`, error);
      return [];
    }
  }

  /**
   * Generic HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    configOverride?: HAConfig
  ): Promise<T> {
    const config = configOverride || this.config;
    
    if (!config) {
      throw new Error('Client not configured');
    }

    const url = `${config.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${config.accessToken}`,
      ...options.headers,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          throw error;
        }

        // Retry with exponential backoff
        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.retryConfig.baseDelay * Math.pow(2, attempt);
          logger.warn(`Request failed, retrying in ${delay}ms...`, {
            attempt: attempt + 1,
            maxRetries: this.retryConfig.maxRetries,
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }
}

// Export singleton instance
export const haClient = new HomeAssistantClient();
