import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWindowFocus } from './useWindowFocus';

describe('useWindowFocus', () => {
  it('should return initial focus state', () => {
    const { result } = renderHook(() => useWindowFocus());
    expect(typeof result.current).toBe('boolean');
  });

  it('should update on window focus event', () => {
    const { result } = renderHook(() => useWindowFocus());

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(result.current).toBe(true);
  });

  it('should update on window blur event', () => {
    const { result } = renderHook(() => useWindowFocus());

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(result.current).toBe(false);
  });

  it('should update on visibility change', () => {
    const { result } = renderHook(() => useWindowFocus());

    // Mock document.hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe(false);

    // Mock visible again
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Note: result depends on document.hasFocus()
    expect(typeof result.current).toBe('boolean');
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const removeDocListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useWindowFocus());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(removeDocListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
});
