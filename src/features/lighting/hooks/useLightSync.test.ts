import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLightSync } from './useLightSync';
import * as lightsAPI from '@/api/homeAssistant/entities/lights';

vi.mock('@/api/homeAssistant/entities/lights', () => ({
  lights: {
    getState: vi.fn(),
    setBrightness: vi.fn(),
    turnOff: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/usePolling', () => ({
  usePolling: vi.fn((callback, options) => {
    // Simple polling mock - just call immediately if enabled
    if (options.enabled) {
      callback();
    }
    return { poll: callback };
  }),
}));

describe('useLightSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultConfig = {
    entityId: 'light.test',
    enabled: true,
    pollingInterval: 1500,
  };

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLightSync(defaultConfig));

    expect(result.current.displayValue).toBe(0);
    expect(result.current.targetValue).toBe(0);
    expect(result.current.confirmedValue).toBe(0);
    expect(result.current.isPending).toBe(false);
  });

  it('should sync from remote on mount', async () => {
    const mockState = {
      state: 'on',
      attributes: { brightness: 200 },
    };

    (lightsAPI.lights.getState as any).mockResolvedValue(mockState);

    const { result } = renderHook(() => useLightSync(defaultConfig));

    await waitFor(() => {
      expect(result.current.confirmedValue).toBeGreaterThan(0);
    });
  });

  it('should not sync when disabled', () => {
    const { result } = renderHook(() =>
      useLightSync({ ...defaultConfig, enabled: false })
    );

    expect(lightsAPI.lights.getState).not.toHaveBeenCalled();
    expect(result.current.displayValue).toBe(0);
  });

  it('should update display value immediately on setValue', async () => {
    const { result } = renderHook(() => useLightSync(defaultConfig));

    await result.current.setValue(75, 'user');

    expect(result.current.displayValue).toBe(75);
  });

  it('should call setBrightness when setting non-zero value', async () => {
    (lightsAPI.lights.setBrightness as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLightSync(defaultConfig));

    await result.current.setValue(50, 'user');

    // Wait for debounce
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(lightsAPI.lights.setBrightness).toHaveBeenCalledWith(
        'light.test',
        expect.any(Number)
      );
    });
  });

  it('should call turnOff when setting zero value', async () => {
    (lightsAPI.lights.turnOff as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLightSync(defaultConfig));

    await result.current.setValue(0, 'user');

    // Wait for debounce
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(lightsAPI.lights.turnOff).toHaveBeenCalledWith('light.test');
    });
  });

  it('should set isPending during API call', async () => {
    (lightsAPI.lights.setBrightness as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useLightSync(defaultConfig));

    await result.current.setValue(75, 'user');

    expect(result.current.isPending).toBe(true);
  });

  it('should call onChange callback when value changes', async () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useLightSync({ ...defaultConfig, onChange })
    );

    await result.current.setValue(60, 'user');

    expect(onChange).toHaveBeenCalledWith(60, 'user');
  });

  it('should handle API errors gracefully', async () => {
    const error = new Error('API Error');
    (lightsAPI.lights.setBrightness as any).mockRejectedValue(error);

    const { result } = renderHook(() => useLightSync(defaultConfig));

    await result.current.setValue(50, 'user');

    vi.advanceTimersByTime(500);

    // Should not crash, error logged
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });

  it('should force sync when forceSync is called', async () => {
    const mockState = {
      state: 'on',
      attributes: { brightness: 150 },
    };

    (lightsAPI.lights.getState as any).mockResolvedValue(mockState);

    const { result } = renderHook(() => useLightSync(defaultConfig));

    await result.current.forceSync();

    await waitFor(() => {
      expect(lightsAPI.lights.getState).toHaveBeenCalled();
    });
  });
});
