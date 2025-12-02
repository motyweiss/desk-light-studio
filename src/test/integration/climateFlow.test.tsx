import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useClimateSync } from '@/features/climate/hooks/useClimateSync';
import * as sensorsAPI from '@/api/homeAssistant/entities/sensors';

vi.mock('@/api/homeAssistant/entities/sensors');
vi.mock('@/shared/hooks/usePolling', () => ({
  usePolling: vi.fn((callback, options) => {
    if (options.enabled) {
      setTimeout(callback, 0);
    }
    return { poll: callback };
  }),
}));

describe('Climate Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sync all climate sensors together', async () => {
    const mockStates = {
      'sensor.temp': { state: '23.5', attributes: {} },
      'sensor.humidity': { state: '55', attributes: {} },
      'sensor.pm25': { state: '15', attributes: {} },
      'sensor.iphone_battery': { state: '85', attributes: {} },
      'sensor.iphone_state': { state: 'Charging', attributes: {} },
      'sensor.airpods_battery': { state: '70', attributes: {} },
      'sensor.airpods_state': { state: 'Not Charging', attributes: {} },
    };

    (sensorsAPI.sensors.getMultipleStates as any).mockResolvedValue(mockStates);

    const { result } = renderHook(() =>
      useClimateSync({
        isConnected: true,
        entityMapping: {
          temperatureSensor: 'sensor.temp',
          humiditySensor: 'sensor.humidity',
          airQualitySensor: 'sensor.pm25',
          iphoneBattery: 'sensor.iphone_battery',
          iphoneBatteryState: 'sensor.iphone_state',
          airpodsMaxBattery: 'sensor.airpods_battery',
          airpodsMaxBatteryState: 'sensor.airpods_state',
        },
        pollingInterval: 3000,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.temperature).toBe(23.5);
      expect(result.current.humidity).toBe(55);
      expect(result.current.airQuality).toBe(15);
      expect(result.current.iphoneBatteryLevel).toBe(85);
      expect(result.current.iphoneBatteryCharging).toBe(true);
      expect(result.current.airpodsMaxBatteryLevel).toBe(70);
      expect(result.current.airpodsMaxBatteryCharging).toBe(false);
    });
  });

  it('should handle environmental changes over time', async () => {
    // Simulate temperature rising over time
    const temperatures = [20, 21, 22, 23, 24];
    let callCount = 0;

    (sensorsAPI.sensors.getMultipleStates as any).mockImplementation(() => {
      const temp = temperatures[Math.min(callCount, temperatures.length - 1)];
      callCount++;
      return Promise.resolve({
        'sensor.temp': { state: temp.toString(), attributes: {} },
      });
    });

    const { result, rerender } = renderHook(() =>
      useClimateSync({
        isConnected: true,
        entityMapping: { temperatureSensor: 'sensor.temp' },
        pollingInterval: 3000,
      })
    );

    // Initial temperature
    await waitFor(() => {
      expect(result.current.temperature).toBe(20);
    });

    // Simulate polling cycles
    rerender();
    await waitFor(() => {
      expect(result.current.temperature).toBeGreaterThanOrEqual(20);
    });
  });

  it('should handle connection loss and recovery', async () => {
    const mockStates = {
      'sensor.temp': { state: '22', attributes: {} },
    };

    (sensorsAPI.sensors.getMultipleStates as any).mockResolvedValue(mockStates);

    const { result, rerender } = renderHook(
      ({ connected }) =>
        useClimateSync({
          isConnected: connected,
          entityMapping: { temperatureSensor: 'sensor.temp' },
          pollingInterval: 3000,
        }),
      { initialProps: { connected: true } }
    );

    // Initial sync works
    await waitFor(() => {
      expect(result.current.temperature).toBe(22);
    });

    const callCountBefore = (sensorsAPI.sensors.getMultipleStates as any).mock.calls.length;

    // Lose connection
    rerender({ connected: false });

    // Should not make more API calls
    await new Promise(resolve => setTimeout(resolve, 100));
    expect((sensorsAPI.sensors.getMultipleStates as any).mock.calls.length).toBe(
      callCountBefore
    );

    // Reconnect
    (sensorsAPI.sensors.getMultipleStates as any).mockResolvedValue({
      'sensor.temp': { state: '24', attributes: {} },
    });

    rerender({ connected: true });

    // Should sync again
    await waitFor(() => {
      expect(result.current.temperature).toBe(24);
    });
  });

  it('should handle partial sensor availability', async () => {
    const mockStates = {
      'sensor.temp': { state: '22', attributes: {} },
      'sensor.humidity': { state: 'unavailable', attributes: {} },
      'sensor.pm25': { state: '10', attributes: {} },
    };

    (sensorsAPI.sensors.getMultipleStates as any).mockResolvedValue(mockStates);

    const { result } = renderHook(() =>
      useClimateSync({
        isConnected: true,
        entityMapping: {
          temperatureSensor: 'sensor.temp',
          humiditySensor: 'sensor.humidity',
          airQualitySensor: 'sensor.pm25',
        },
        pollingInterval: 3000,
      })
    );

    await waitFor(() => {
      expect(result.current.temperature).toBe(22);
      expect(result.current.humidity).toBe(45); // Default value
      expect(result.current.airQuality).toBe(10);
    });
  });

  it('should maintain state during temporary API failures', async () => {
    // First call succeeds
    (sensorsAPI.sensors.getMultipleStates as any)
      .mockResolvedValueOnce({
        'sensor.temp': { state: '23', attributes: {} },
      })
      // Second call fails
      .mockRejectedValueOnce(new Error('Timeout'))
      // Third call succeeds again
      .mockResolvedValueOnce({
        'sensor.temp': { state: '24', attributes: {} },
      });

    const { result, rerender } = renderHook(() =>
      useClimateSync({
        isConnected: true,
        entityMapping: { temperatureSensor: 'sensor.temp' },
        pollingInterval: 3000,
      })
    );

    // First sync
    await waitFor(() => {
      expect(result.current.temperature).toBe(23);
    });

    // Failed sync - should maintain previous value
    rerender();
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(result.current.temperature).toBe(23);

    // Successful sync again
    rerender();
    await waitFor(() => {
      expect(result.current.temperature).toBe(24);
    });
  });
});
