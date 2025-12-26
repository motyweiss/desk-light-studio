import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sensors } from './sensors';
import { haClient } from '../client';

// Mock the haClient
vi.mock('../client', () => ({
  haClient: {
    getEntityState: vi.fn(),
    getConfig: vi.fn(() => ({ baseUrl: 'http://test', accessToken: 'token' }))
  }
}));

describe('sensors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMultipleStates', () => {
    it('should return all states when all requests succeed', async () => {
      const mockGetEntityState = haClient.getEntityState as ReturnType<typeof vi.fn>;
      mockGetEntityState.mockImplementation((entityId: string) => {
        const states: Record<string, any> = {
          'sensor.temperature': { entity_id: 'sensor.temperature', state: '22.5' },
          'sensor.humidity': { entity_id: 'sensor.humidity', state: '45' },
          'sensor.pm25': { entity_id: 'sensor.pm25', state: '12' }
        };
        return Promise.resolve(states[entityId] || null);
      });

      const result = await sensors.getMultipleStates([
        'sensor.temperature',
        'sensor.humidity',
        'sensor.pm25'
      ]);

      expect(result['sensor.temperature']?.state).toBe('22.5');
      expect(result['sensor.humidity']?.state).toBe('45');
      expect(result['sensor.pm25']?.state).toBe('12');
    });

    it('should return partial results when some requests fail', async () => {
      const mockGetEntityState = haClient.getEntityState as ReturnType<typeof vi.fn>;
      mockGetEntityState.mockImplementation((entityId: string) => {
        if (entityId === 'sensor.offline') {
          return Promise.reject(new Error('503: Service Unavailable'));
        }
        return Promise.resolve({ entity_id: entityId, state: '22' });
      });

      const result = await sensors.getMultipleStates([
        'sensor.temperature',
        'sensor.offline',
        'sensor.humidity'
      ]);

      // Should have results for working sensors
      expect(result['sensor.temperature']?.state).toBe('22');
      expect(result['sensor.humidity']?.state).toBe('22');
      
      // Failed sensor should be null, not throw
      expect(result['sensor.offline']).toBeNull();
    });

    it('should not block other requests when one times out', async () => {
      const mockGetEntityState = haClient.getEntityState as ReturnType<typeof vi.fn>;
      mockGetEntityState.mockImplementation((entityId: string) => {
        if (entityId === 'sensor.slow') {
          // Simulate slow request
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 100);
          });
        }
        return Promise.resolve({ entity_id: entityId, state: '22' });
      });

      const startTime = Date.now();
      const result = await sensors.getMultipleStates([
        'sensor.temperature',
        'sensor.slow',
        'sensor.humidity'
      ]);
      const elapsed = Date.now() - startTime;

      // Should complete quickly, not wait for all retries
      expect(elapsed).toBeLessThan(5000);
      
      // Working sensors should have results
      expect(result['sensor.temperature']?.state).toBe('22');
      expect(result['sensor.humidity']?.state).toBe('22');
      expect(result['sensor.slow']).toBeNull();
    });

    it('should handle empty entity list', async () => {
      const result = await sensors.getMultipleStates([]);
      expect(result).toEqual({});
    });

    it('should handle all requests failing', async () => {
      const mockGetEntityState = haClient.getEntityState as ReturnType<typeof vi.fn>;
      mockGetEntityState.mockRejectedValue(new Error('All offline'));

      const result = await sensors.getMultipleStates([
        'sensor.a',
        'sensor.b',
        'sensor.c'
      ]);

      expect(result['sensor.a']).toBeNull();
      expect(result['sensor.b']).toBeNull();
      expect(result['sensor.c']).toBeNull();
    });
  });

  describe('getValue', () => {
    it('should parse numeric state correctly', async () => {
      const mockGetEntityState = haClient.getEntityState as ReturnType<typeof vi.fn>;
      mockGetEntityState.mockResolvedValue({
        entity_id: 'sensor.temperature',
        state: '22.75'
      });

      const value = await sensors.getValue('sensor.temperature');
      expect(value).toBe(22.75);
    });

    it('should return null for non-numeric state', async () => {
      const mockGetEntityState = haClient.getEntityState as ReturnType<typeof vi.fn>;
      mockGetEntityState.mockResolvedValue({
        entity_id: 'sensor.status',
        state: 'unavailable'
      });

      const value = await sensors.getValue('sensor.status');
      expect(value).toBeNull();
    });

    it('should return null when entity not found', async () => {
      const mockGetEntityState = haClient.getEntityState as ReturnType<typeof vi.fn>;
      mockGetEntityState.mockResolvedValue(null);

      const value = await sensors.getValue('sensor.missing');
      expect(value).toBeNull();
    });
  });
});
