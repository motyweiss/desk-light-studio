import { describe, it, expect, vi, beforeEach } from 'vitest';
import { perfStart, perfEnd, measureAsync, measure } from './performance';

describe('Performance utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('perfStart and perfEnd', () => {
    it('should measure duration', () => {
      perfStart('test-operation');
      
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // busy wait
      }
      
      const duration = perfEnd('test-operation');
      
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeGreaterThanOrEqual(10);
    });

    it('should return 0 for non-existent mark', () => {
      const duration = perfEnd('non-existent');
      expect(duration).toBe(0);
    });
  });

  describe('measureAsync', () => {
    it('should measure async function execution', async () => {
      const asyncFn = vi.fn().mockResolvedValue('result');
      
      const result = await measureAsync('async-test', asyncFn);
      
      expect(result).toBe('result');
      expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it('should handle async function errors', async () => {
      const error = new Error('Async error');
      const asyncFn = vi.fn().mockRejectedValue(error);
      
      await expect(measureAsync('async-error', asyncFn)).rejects.toThrow(
        'Async error'
      );
    });
  });

  describe('measure', () => {
    it('should measure sync function execution', () => {
      const syncFn = vi.fn().mockReturnValue('result');
      
      const result = measure('sync-test', syncFn);
      
      expect(result).toBe('result');
      expect(syncFn).toHaveBeenCalledTimes(1);
    });

    it('should handle sync function errors', () => {
      const error = new Error('Sync error');
      const syncFn = vi.fn().mockImplementation(() => {
        throw error;
      });
      
      expect(() => measure('sync-error', syncFn)).toThrow('Sync error');
    });
  });
});
