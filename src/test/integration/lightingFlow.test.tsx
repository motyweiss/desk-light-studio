import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLightSync } from '@/features/lighting/hooks/useLightSync';
import * as lightsAPI from '@/api/homeAssistant/entities/lights';

vi.mock('@/api/homeAssistant/entities/lights');
vi.mock('@/shared/hooks/usePolling', () => ({
  usePolling: vi.fn((callback, options) => {
    if (options.enabled) {
      setTimeout(callback, 0);
    }
    return { poll: callback };
  }),
}));

describe('Lighting Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should complete full light control flow', async () => {
    // Setup: Light is initially off
    (lightsAPI.lights.getState as any).mockResolvedValue({
      state: 'off',
      attributes: { brightness: 0 },
    });

    (lightsAPI.lights.setBrightness as any).mockResolvedValue(undefined);
    (lightsAPI.lights.turnOff as any).mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useLightSync({
        entityId: 'light.desk_lamp',
        enabled: true,
        pollingInterval: 1500,
      })
    );

    // Step 1: Initial state should be off
    expect(result.current.displayValue).toBe(0);

    // Step 2: User turns light on to 75%
    await result.current.setValue(75, 'user');

    expect(result.current.displayValue).toBe(75);
    expect(result.current.isPending).toBe(true);

    // Step 3: Wait for debounce and API call
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(lightsAPI.lights.setBrightness).toHaveBeenCalledWith(
        'light.desk_lamp',
        expect.any(Number)
      );
    });

    // Step 4: Simulate successful sync
    (lightsAPI.lights.getState as any).mockResolvedValue({
      state: 'on',
      attributes: { brightness: 191 }, // 75% of 255
    });

    await result.current.forceSync();

    await waitFor(() => {
      expect(result.current.confirmedValue).toBeGreaterThan(70);
    });

    // Step 5: User adjusts brightness to 50%
    await result.current.setValue(50, 'user');

    expect(result.current.displayValue).toBe(50);

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(lightsAPI.lights.setBrightness).toHaveBeenCalledTimes(2);
    });

    // Step 6: User turns light off
    await result.current.setValue(0, 'user');

    expect(result.current.displayValue).toBe(0);

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(lightsAPI.lights.turnOff).toHaveBeenCalledWith('light.desk_lamp');
    });
  });

  it('should handle concurrent updates correctly', async () => {
    (lightsAPI.lights.getState as any).mockResolvedValue({
      state: 'on',
      attributes: { brightness: 100 },
    });

    (lightsAPI.lights.setBrightness as any).mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useLightSync({
        entityId: 'light.test',
        enabled: true,
        pollingInterval: 1500,
      })
    );

    // Rapid successive changes (simulating slider drag)
    await result.current.setValue(30, 'user');
    await result.current.setValue(50, 'user');
    await result.current.setValue(70, 'user');
    await result.current.setValue(90, 'user');

    // Display should show latest value immediately
    expect(result.current.displayValue).toBe(90);

    // Wait for debounce
    vi.advanceTimersByTime(500);

    // Should only call API once with final value
    await waitFor(() => {
      expect(lightsAPI.lights.setBrightness).toHaveBeenCalledTimes(1);
    });
  });

  it('should recover from API failures', async () => {
    (lightsAPI.lights.getState as any).mockResolvedValue({
      state: 'on',
      attributes: { brightness: 100 },
    });

    // First call fails, second succeeds
    (lightsAPI.lights.setBrightness as any)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      useLightSync({
        entityId: 'light.test',
        enabled: true,
        pollingInterval: 1500,
      })
    );

    // User sets value
    await result.current.setValue(60, 'user');

    vi.advanceTimersByTime(500);

    // First attempt fails
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    // User retries
    await result.current.setValue(60, 'user');

    vi.advanceTimersByTime(500);

    // Second attempt succeeds
    await waitFor(() => {
      expect(lightsAPI.lights.setBrightness).toHaveBeenCalledTimes(2);
    });
  });

  it('should sync with external changes via polling', async () => {
    let brightness = 0;

    (lightsAPI.lights.getState as any).mockImplementation(() =>
      Promise.resolve({
        state: brightness > 0 ? 'on' : 'off',
        attributes: { brightness },
      })
    );

    const { result } = renderHook(() =>
      useLightSync({
        entityId: 'light.test',
        enabled: true,
        pollingInterval: 1500,
      })
    );

    // Initial state
    await waitFor(() => {
      expect(result.current.confirmedValue).toBe(0);
    });

    // Simulate external change (physical switch, other app)
    brightness = 200;

    // Trigger sync
    await result.current.forceSync();

    await waitFor(() => {
      expect(result.current.confirmedValue).toBeGreaterThan(0);
    });
  });
});
