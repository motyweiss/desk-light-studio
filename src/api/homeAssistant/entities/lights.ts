import { haProxyClient } from '@/services/haProxyClient';
import type { HALightEntity, HAEntity } from '../types';
import { logger } from '@/shared/utils/logger';

/**
 * Light entity operations
 * Uses haProxyClient for consistent connection handling
 */

// Cache for batch fetched states
let allStatesCache: HAEntity[] | null = null;
let allStatesCacheTime = 0;
const CACHE_TTL = 2000; // 2 second cache

const ensureConfigured = (): boolean => {
  const config = haProxyClient.getDirectConfig();
  if (!config) {
    logger.warn('Light API called but haProxyClient not configured');
    return false;
  }
  return true;
};

export const lights = {
  /**
   * Check if client is ready for operations
   */
  isReady(): boolean {
    return ensureConfigured();
  },

  /**
   * Turn light on
   */
  async turnOn(entityId: string, brightness?: number): Promise<void> {
    if (!ensureConfigured()) {
      throw new Error('Home Assistant not configured. Please check connection settings.');
    }

    const serviceData: Record<string, any> = { entity_id: entityId };
    
    if (brightness !== undefined) {
      serviceData.brightness = Math.round((brightness / 100) * 255);
    }

    logger.light(entityId, `Sending turn_on command (brightness: ${brightness ?? 'default'})`);
    const { error } = await haProxyClient.post(`/api/services/light/turn_on`, serviceData);
    if (error) {
      logger.error(`Failed to turn on ${entityId}`, error);
      throw new Error(error);
    }
    logger.light(entityId, `Turned on successfully`);
  },

  /**
   * Turn light off
   */
  async turnOff(entityId: string): Promise<void> {
    if (!ensureConfigured()) {
      throw new Error('Home Assistant not configured. Please check connection settings.');
    }

    logger.light(entityId, 'Sending turn_off command');
    const { error } = await haProxyClient.post(`/api/services/light/turn_off`, { entity_id: entityId });
    if (error) {
      logger.error(`Failed to turn off ${entityId}`, error);
      throw new Error(error);
    }
    logger.light(entityId, 'Turned off successfully');
  },

  /**
   * Set light brightness
   */
  async setBrightness(entityId: string, brightness: number): Promise<void> {
    if (!ensureConfigured()) {
      throw new Error('Home Assistant not configured. Please check connection settings.');
    }

    const brightnessValue = Math.round((brightness / 100) * 255);
    logger.light(entityId, `Sending brightness command: ${brightness}% (raw: ${brightnessValue})`);
    const { error } = await haProxyClient.post(`/api/services/light/turn_on`, {
      entity_id: entityId,
      brightness: brightnessValue,
    });
    if (error) {
      logger.error(`Failed to set brightness for ${entityId}`, error);
      throw new Error(error);
    }
    logger.light(entityId, `Set brightness to ${brightness}% successfully`);
  },

  /**
   * Toggle light
   */
  async toggle(entityId: string): Promise<void> {
    if (!ensureConfigured()) {
      throw new Error('Home Assistant not configured. Please check connection settings.');
    }

    logger.light(entityId, 'Sending toggle command');
    const { error } = await haProxyClient.post(`/api/services/light/toggle`, { entity_id: entityId });
    if (error) {
      logger.error(`Failed to toggle ${entityId}`, error);
      throw new Error(error);
    }
    logger.light(entityId, 'Toggled successfully');
  },

  /**
   * Get all light states at once (batch fetch)
   */
  async getAllStates(): Promise<HAEntity[]> {
    if (!ensureConfigured()) {
      return [];
    }

    // Return cached data if still valid
    if (allStatesCache && Date.now() - allStatesCacheTime < CACHE_TTL) {
      return allStatesCache;
    }

    const { data, error } = await haProxyClient.get<HAEntity[]>('/api/states');
    if (error || !data) {
      return allStatesCache || [];
    }

    allStatesCache = data;
    allStatesCacheTime = Date.now();
    return data;
  },

  /**
   * Get light state - uses batch fetch for efficiency
   */
  async getState(entityId: string): Promise<HALightEntity | null> {
    if (!ensureConfigured()) {
      return null;
    }

    // Use batch fetch and filter locally
    const allStates = await this.getAllStates();
    const entity = allStates.find(e => e.entity_id === entityId);
    
    if (!entity) {
      // Entity not found - don't log as error, it might just not be configured
      return null;
    }
    
    return entity as HALightEntity;
  },

  /**
   * Get multiple light states efficiently
   */
  async getMultipleStates(entityIds: string[]): Promise<Record<string, HALightEntity | null>> {
    if (!ensureConfigured() || entityIds.length === 0) {
      return {};
    }

    const allStates = await this.getAllStates();
    const entitySet = new Set(entityIds);
    const result: Record<string, HALightEntity | null> = {};

    for (const entity of allStates) {
      if (entitySet.has(entity.entity_id)) {
        result[entity.entity_id] = entity as HALightEntity;
      }
    }

    // Fill in nulls for missing entities
    for (const entityId of entityIds) {
      if (!(entityId in result)) {
        result[entityId] = null;
      }
    }

    return result;
  },
};
