import { haProxyClient } from '@/services/haProxyClient';
import type { HALightEntity } from '../types';
import { logger } from '@/shared/utils/logger';

/**
 * Light entity operations
 * Uses haProxyClient for consistent connection handling
 */

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
   * Get light state
   */
  async getState(entityId: string): Promise<HALightEntity | null> {
    if (!ensureConfigured()) {
      logger.warn(`Cannot get state for ${entityId} - not configured`);
      return null;
    }

    const { data, error } = await haProxyClient.get<HALightEntity>(`/api/states/${entityId}`);
    if (error || !data) {
      logger.error(`Failed to get state for ${entityId}`, error);
      return null;
    }
    return data;
  },
};
