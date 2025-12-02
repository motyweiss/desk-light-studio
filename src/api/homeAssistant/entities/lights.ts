import { haClient } from '../client';
import type { HALightEntity } from '../types';
import { logger } from '@/shared/utils/logger';

/**
 * Light entity operations
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

    await haClient.callService('light', 'turn_on', serviceData);
    logger.light(entityId, `Turned on (brightness: ${brightness ?? 'default'})`);
  },

  /**
   * Turn light off
   */
  async turnOff(entityId: string): Promise<void> {
    await haClient.callService('light', 'turn_off', { entity_id: entityId });
    logger.light(entityId, 'Turned off');
  },

  /**
   * Set light brightness
   */
  async setBrightness(entityId: string, brightness: number): Promise<void> {
    const brightnessValue = Math.round((brightness / 100) * 255);
    await haClient.callService('light', 'turn_on', {
      entity_id: entityId,
      brightness: brightnessValue,
    });
    logger.light(entityId, `Set brightness to ${brightness}%`);
  },

  /**
   * Toggle light
   */
  async toggle(entityId: string): Promise<void> {
    await haClient.callService('light', 'toggle', { entity_id: entityId });
    logger.light(entityId, 'Toggled');
  },

  /**
   * Get light state
   */
  async getState(entityId: string): Promise<HALightEntity | null> {
    const entity = await haClient.getEntityState(entityId);
    return entity as HALightEntity | null;
  },
};
