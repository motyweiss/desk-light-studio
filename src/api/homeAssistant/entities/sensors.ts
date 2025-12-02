import { haClient } from '../client';
import type { HASensorEntity } from '../types';
import { logger } from '@/shared/utils/logger';

/**
 * Sensor entity operations
 */

export const sensors = {
  /**
   * Get sensor state
   */
  async getState(entityId: string): Promise<HASensorEntity | null> {
    const entity = await haClient.getEntityState(entityId);
    
    if (!entity) {
      logger.warn(`Sensor not found: ${entityId}`);
      return null;
    }

    return entity as HASensorEntity;
  },

  /**
   * Get sensor value as number
   */
  async getValue(entityId: string): Promise<number | null> {
    const entity = await this.getState(entityId);
    
    if (!entity) return null;

    const value = parseFloat(entity.state);
    return isNaN(value) ? null : value;
  },

  /**
   * Get multiple sensor states at once
   */
  async getMultipleStates(entityIds: string[]): Promise<Record<string, HASensorEntity | null>> {
    const result: Record<string, HASensorEntity | null> = {};

    await Promise.all(
      entityIds.map(async (entityId) => {
        result[entityId] = await this.getState(entityId);
      })
    );

    return result;
  },
};
