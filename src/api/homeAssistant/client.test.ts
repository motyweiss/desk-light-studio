import { describe, it, expect, vi, beforeEach } from 'vitest';
import { haClient } from './client';
import type { HAConfig } from './types';

describe('HomeAssistantClient', () => {
  const mockConfig: HAConfig = {
    baseUrl: 'http://localhost:8123',
    accessToken: 'test-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('setConfig', () => {
    it('should set configuration', () => {
      haClient.setConfig(mockConfig);
      const config = haClient.getConfig();
      expect(config).toEqual(mockConfig);
    });
  });

  describe('testConnection', () => {
    it('should return success on valid connection', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'API running', version: '2023.1.0' }),
      });

      const result = await haClient.testConnection(mockConfig);

      expect(result.success).toBe(true);
      expect(result.version).toBe('2023.1.0');
    });

    it('should return error on failed connection', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await haClient.testConnection(mockConfig);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Network error');
    });
  });

  describe('getEntityState', () => {
    it('should fetch entity state', async () => {
      const mockEntity = {
        entity_id: 'light.test',
        state: 'on',
        attributes: { brightness: 255 },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntity,
      });

      haClient.setConfig(mockConfig);
      const entity = await haClient.getEntityState('light.test');

      expect(entity).toEqual(mockEntity);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8123/api/states/light.test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should return null on error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Not found'));

      haClient.setConfig(mockConfig);
      const entity = await haClient.getEntityState('light.invalid');

      expect(entity).toBeNull();
    });
  });

  describe('callService', () => {
    it('should call service with data', async () => {
      const mockResponse = [{ entity_id: 'light.test', state: 'on' }];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      haClient.setConfig(mockConfig);
      const result = await haClient.callService('light', 'turn_on', {
        entity_id: 'light.test',
        brightness: 255,
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8123/api/services/light/turn_on',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ entity_id: 'light.test', brightness: 255 }),
        })
      );
    });

    it('should throw on service call error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Service error'));

      haClient.setConfig(mockConfig);

      await expect(
        haClient.callService('light', 'turn_on', {})
      ).rejects.toThrow('Service error');
    });
  });

  describe('retry logic', () => {
    it('should retry on failure', async () => {
      // First call fails, second succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ entity_id: 'light.test', state: 'on' }),
        });

      haClient.setConfig(mockConfig);
      const entity = await haClient.getEntityState('light.test');

      expect(entity).toBeTruthy();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error('HTTP 404: Not Found')
      );

      haClient.setConfig(mockConfig);

      await expect(haClient.getEntityState('light.invalid')).resolves.toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
