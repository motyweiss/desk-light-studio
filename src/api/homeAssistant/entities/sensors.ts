import { haProxyClient } from '@/services/haProxyClient';
import type { HASensorEntity } from '../types';
import { logger } from '@/shared/utils/logger';

/**
 * Sensor entity operations
 * Uses haProxyClient for consistent connection handling
 */

export const sensors = {
  /**
   * Get sensor state
   */
  async getState(entityId: string): Promise<HASensorEntity | null> {
    const { data, error } = await haProxyClient.get<HASensorEntity>(`/api/states/${entityId}`);
    
    if (error || !data) {
      logger.error(`Failed to get state for ${entityId}`, error);
      return null;
    }

    return data;
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
   * Get multiple sensor states at once - resilient to individual failures
   */
  async getMultipleStates(entityIds: string[]): Promise<Record<string, HASensorEntity | null>> {
    const result: Record<string, HASensorEntity | null> = {};

    await Promise.all(
      entityIds.map(async (entityId) => {
        try {
          result[entityId] = await this.getState(entityId);
        } catch (error) {
          // Log but don't fail the entire batch
          logger.warn(`Failed to fetch sensor ${entityId}:`, error);
          result[entityId] = null;
        }
      })
    );

    return result;
  },
};
