import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePolling } from './usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should call fetcher immediately when enabled', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    const onSuccess = vi.fn();

    renderHook(() =>
      usePolling(fetcher, {
        interval: 1000,
        enabled: true,
        onSuccess,
      })
    );

    await vi.waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  it('should poll at specified interval', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    const onSuccess = vi.fn();

    renderHook(() =>
      usePolling(fetcher, {
        interval: 1000,
        enabled: true,
        onSuccess,
      })
    );

    await vi.waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    // Advance by interval
    vi.advanceTimersByTime(1000);

    await vi.waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    // Advance again
    vi.advanceTimersByTime(1000);

    await vi.waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(3);
    });
  });

  it('should not poll when disabled', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');

    renderHook(() =>
      usePolling(fetcher, {
        interval: 1000,
        enabled: false,
      })
    );

    vi.advanceTimersByTime(5000);

    expect(fetcher).not.toHaveBeenCalled();
  });

  it('should call onSuccess with data', async () => {
    const data = { test: 'data' };
    const fetcher = vi.fn().mockResolvedValue(data);
    const onSuccess = vi.fn();

    renderHook(() =>
      usePolling(fetcher, {
        interval: 1000,
        enabled: true,
        onSuccess,
      })
    );

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(data);
    });
  });

  it('should call onError when fetcher fails', async () => {
    const error = new Error('Fetch failed');
    const fetcher = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    renderHook(() =>
      usePolling(fetcher, {
        interval: 1000,
        enabled: true,
        onError,
      })
    );

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should cleanup interval on unmount', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');

    const { unmount } = renderHook(() =>
      usePolling(fetcher, {
        interval: 1000,
        enabled: true,
      })
    );

    await vi.waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Advance time after unmount
    vi.advanceTimersByTime(5000);

    // Should not call fetcher after unmount
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should stop polling when enabled changes to false', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');

    const { rerender } = renderHook(
      ({ enabled }) =>
        usePolling(fetcher, {
          interval: 1000,
          enabled,
        }),
      { initialProps: { enabled: true } }
    );

    await vi.waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    // Disable polling
    rerender({ enabled: false });

    vi.advanceTimersByTime(5000);

    // Should not poll anymore
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
