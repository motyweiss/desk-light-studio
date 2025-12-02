import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useClimateSync } from './useClimateSync';
import * as sensorsAPI from '@/api/homeAssistant/entities/sensors';

vi.mock('@/api/homeAssistant/entities/sensors', () => ({
  sensors: {
    getMultipleStates: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/usePolling', () => ({
  usePolling: vi.fn((callback, options) => {
    if (options.enabled) {
      callback();
    }
    return { poll: callback };
  }),
}));

describe('useClimateSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultConfig = {
    isConnected: true,
    entityMapping: {
      temperatureSensor: 'sensor.temp',
      humiditySensor: 'sensor.humidity',
      airQualitySensor: 'sensor.pm25',
    },
    pollingInterval: 3000,
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useClimateSync(defaultConfig));

    expect(result.current.temperature).toBe(22);
    expect(result.current.humidity).toBe(45);
    expect(result.current.airQuality).toBe(5);
    expect(result.current.isLoaded).toBe(false);
  });

  it('should sync climate data on mount', async () => {
    const mockStates = {
      'sensor.temp': { state: '23.5', attributes: {} },
      'sensor.humidity': { state: '50', attributes: {} },
      'sensor.pm25': { state: '12', attributes: {} },
    };

    (sensorsAPI.sensors.getMultipleStates as any).mockResolvedValue(mockStates);

    const { result } = renderHook(() => useClimateSync(defaultConfig));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.temperature).toBe(23.5);
      expect(result.current.humidity).toBe(50);
      expect(result.current.airQuality).toBe(12);
    });
  });

  it('should not sync when not connected', () => {
    renderHook(() =>
      useClimateSync({ ...defaultConfig, isConnected: false })
    );

    expect(sensorsAPI.sensors.getMultipleStates).not.toHaveBeenCalled();
  });

  it('should handle missing entity mappings', async () => {
    const { result } = renderHook(() =>
      useClimateSync({
        isConnected: true,
        entityMapping: {},
        pollingInterval: 3000,
      })
    );

    expect(sensorsAPI.sensors.getMultipleStates).not.toHaveBeenCalled();
    expect(result.current.temperature).toBe(22);
  });

  it('should parse temperature correctly', async () => {
    const mockStates = {
      'sensor.temp': { state: '25.8', attributes: {} },
    };

    (sensorsAPI.sensors.getMultipleStates as any).mockResolvedValue(mockStates);

    const { result } = renderHook(() =>
      useClimateSync({
        ...defaultConfig,
        entityMapping: { temperatureSensor: 'sensor.temp' },
      })
    );

    await waitFor(() => {
      expect(result.current.temperature).toBe(25.8);
    });
  });

  it('should parse humidity correctly', async () => {
    const mockStates = {
      'sensor.humidity': { state: '65', attributes: {} },
    };

    (sensorsAPI.sensors.getMultipleStates as any).mockResolvedValue(mockStates);

    const { result } = renderHook(() =>
      useClimateSync({
        ...defaultConfig,
        entityMapping: { humiditySensor: 'sensor.humidity' },
      })
    );

    await waitFor(() => {
      expect(result.current.humidity).toBe(65);
    });
  });

  it('should detect battery charging status', async () => {
    const mockStates = {
      'sensor.battery': { state: '80', attributes: {} },
      'sensor.battery_state': { state: 'Charging', attributes: {} },
    };

    (sensorsAPI.sensors.getMultipleStates as any).mockResolvedValue(mockStates);

    const { result } = renderHook(() =>
      useClimateSync({
        ...defaultConfig,
        entityMapping: {
          iphoneBattery: 'sensor.battery',
          iphoneBatteryState: 'sensor.battery_state',
        },
      })
    );

    await waitFor(() => {
      expect(result.current.iphoneBatteryLevel).toBe(80);
      expect(result.current.iphoneBatteryCharging).toBe(true);
    });
  });

  it('should detect battery not charging status', async () => {
    const mockStates = {
      'sensor.battery': { state: '60', attributes: {} },
      'sensor.battery_state': { state: 'Not Charging', attributes: {} },
    };

    (sensorsAPI.sensors.getMultipleStates as any).mockResolvedValue(mockStates);

    const { result } = renderHook(() =>
      useClimateSync({
        ...defaultConfig,
        entityMapping: {
          iphoneBattery: 'sensor.battery',
          iphoneBatteryState: 'sensor.battery_state',
        },
      })
    );

    await waitFor(() => {
      expect(result.current.iphoneBatteryLevel).toBe(60);
      expect(result.current.iphoneBatteryCharging).toBe(false);
    });
  });

  it('should handle API errors gracefully', async () => {
    (sensorsAPI.sensors.getMultipleStates as any).mockRejectedValue(
      new Error('API Error')
    );

    const { result } = renderHook(() => useClimateSync(defaultConfig));

    // Should not crash, maintains default values
    await waitFor(() => {
      expect(result.current.temperature).toBe(22);
      expect(result.current.isLoaded).toBe(false);
    });
  });

  it('should ignore invalid numeric values', async () => {
    const mockStates = {
      'sensor.temp': { state: 'unavailable', attributes: {} },
      'sensor.humidity': { state: 'unknown', attributes: {} },
    };

    (sensorsAPI.sensors.getMultipleStates as any).mockResolvedValue(mockStates);

    const { result } = renderHook(() => useClimateSync(defaultConfig));

    await waitFor(() => {
      // Should maintain default values when parsing fails
      expect(result.current.temperature).toBe(22);
      expect(result.current.humidity).toBe(45);
    });
  });
});
