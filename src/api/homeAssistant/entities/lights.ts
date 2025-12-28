import { haProxyClient } from '@/services/haProxyClient';
import type { HALightEntity } from '../types';
import { logger } from '@/shared/utils/logger';

/**
 * Light entity operations
 * Uses haProxyClient for consistent connection handling
 */

export const lights = {
  /**
   * Turn light on
   */
  async turnOn(entityId: string, brightness?: number): Promise<void> {
    const serviceData: Record<string, any> = { entity_id: entityId };
    
    if (brightness !== undefined) {
      serviceData.brightness = Math.round((brightness / 100) * 255);
    }

    const { error } = await haProxyClient.post(`/api/services/light/turn_on`, serviceData);
    if (error) {
      logger.error(`Failed to turn on ${entityId}`, error);
      throw new Error(error);
    }
    logger.light(entityId, `Turned on (brightness: ${brightness ?? 'default'})`);
  },

  /**
   * Turn light off
   */
  async turnOff(entityId: string): Promise<void> {
    const { error } = await haProxyClient.post(`/api/services/light/turn_off`, { entity_id: entityId });
    if (error) {
      logger.error(`Failed to turn off ${entityId}`, error);
      throw new Error(error);
    }
    logger.light(entityId, 'Turned off');
  },

  /**
   * Set light brightness
   */
  async setBrightness(entityId: string, brightness: number): Promise<void> {
    const brightnessValue = Math.round((brightness / 100) * 255);
    const { error } = await haProxyClient.post(`/api/services/light/turn_on`, {
      entity_id: entityId,
      brightness: brightnessValue,
    });
    if (error) {
      logger.error(`Failed to set brightness for ${entityId}`, error);
      throw new Error(error);
    }
    logger.light(entityId, `Set brightness to ${brightness}%`);
  },

  /**
   * Toggle light
   */
  async toggle(entityId: string): Promise<void> {
    const { error } = await haProxyClient.post(`/api/services/light/toggle`, { entity_id: entityId });
    if (error) {
      logger.error(`Failed to toggle ${entityId}`, error);
      throw new Error(error);
    }
    logger.light(entityId, 'Toggled');
  },

  /**
   * Get light state
   */
  async getState(entityId: string): Promise<HALightEntity | null> {
    const { data, error } = await haProxyClient.get<HALightEntity>(`/api/states/${entityId}`);
    if (error || !data) {
      logger.error(`Failed to get state for ${entityId}`, error);
      return null;
    }
    return data;
  },
};
