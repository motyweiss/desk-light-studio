import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'changed', delay: 500 });

    // Should still be initial
    expect(result.current).toBe('initial');

    // Advance time
    vi.advanceTimersByTime(500);

    await vi.waitFor(() => {
      expect(result.current).toBe('changed');
    });
  });

  it('should reset timer on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    // Rapid changes
    rerender({ value: 'second', delay: 500 });
    vi.advanceTimersByTime(200);

    rerender({ value: 'third', delay: 500 });
    vi.advanceTimersByTime(200);

    rerender({ value: 'fourth', delay: 500 });

    // Should still be first
    expect(result.current).toBe('first');

    // Wait full delay from last change
    vi.advanceTimersByTime(500);

    await vi.waitFor(() => {
      expect(result.current).toBe('fourth');
    });
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Call multiple times rapidly
    result.current('first');
    result.current('second');
    result.current('third');

    // Should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Advance time
    vi.advanceTimersByTime(500);

    // Should only be called once with last value
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('should cancel previous timer on new call', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    result.current('first');
    vi.advanceTimersByTime(200);

    result.current('second');
    vi.advanceTimersByTime(200);

    result.current('third');

    // Should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Advance full delay from last call
    vi.advanceTimersByTime(500);

    // Should only be called once
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('should cleanup on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, 500)
    );

    result.current('test');
    unmount();

    vi.advanceTimersByTime(1000);

    // Should not be called after unmount
    expect(callback).not.toHaveBeenCalled();
  });
});
