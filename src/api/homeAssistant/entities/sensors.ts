import { haProxyClient } from '@/services/haProxyClient';
import type { HASensorEntity } from '../types';

/**
 * Sensor entity operations
 * Uses haProxyClient for consistent connection handling
 */

// Cache for batch fetch to avoid repeated full state fetches
let allStatesCache: { data: HASensorEntity[] | null; timestamp: number } = { data: null, timestamp: 0 };
const BATCH_CACHE_TTL = 2000; // 2 seconds

export const sensors = {
  /**
   * Get sensor state
   */
  async getState(entityId: string): Promise<HASensorEntity | null> {
    const { data, error } = await haProxyClient.get<HASensorEntity>(`/api/states/${entityId}`);
    
    if (error || !data) {
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
   * Get all entity states at once (batch fetch)
   * Much more efficient than individual calls
   */
  async getAllStates(): Promise<HASensorEntity[]> {
    // Check cache
    if (allStatesCache.data && Date.now() - allStatesCache.timestamp < BATCH_CACHE_TTL) {
      return allStatesCache.data;
    }

    const { data, error } = await haProxyClient.get<HASensorEntity[]>('/api/states');
    
    if (error || !data) {
      return allStatesCache.data || []; // Return stale cache if available
    }

    // Update cache
    allStatesCache = { data, timestamp: Date.now() };
    return data;
  },

  /**
   * Get multiple sensor states at once using batch fetch
   * Fetches all states once and filters locally - much more efficient
   */
  async getMultipleStates(entityIds: string[]): Promise<Record<string, HASensorEntity | null>> {
    if (entityIds.length === 0) {
      return {};
    }

    const result: Record<string, HASensorEntity | null> = {};
    
    // Initialize all requested entities as null
    entityIds.forEach(id => {
      result[id] = null;
    });

    try {
      // Fetch all states at once
      const allStates = await this.getAllStates();
      
      // Filter to requested entities
      const entitySet = new Set(entityIds);
      for (const state of allStates) {
        if (entitySet.has(state.entity_id)) {
          result[state.entity_id] = state;
        }
      }
    } catch {
      // Silent fail - result already initialized with nulls
    }

    return result;
  },
};
