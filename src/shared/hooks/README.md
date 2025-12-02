# Shared Hooks

Reusable React hooks for common patterns across the application.

## Available Hooks

### `usePolling`
Generic polling hook with window focus detection.

```typescript
import { usePolling } from '@/shared/hooks';

const { poll } = usePolling(
  async () => await fetchData(),
  {
    interval: 1500,      // Poll every 1.5 seconds
    enabled: true,       // Enable/disable polling
    runOnFocus: true,    // Auto-sync when window regains focus
    onSuccess: (data) => console.log(data),
    onError: (error) => console.error(error),
  }
);

// Manual trigger
poll();
```

**Features:**
- Automatic cleanup on unmount
- Window focus detection (auto-syncs when tab becomes active)
- Enable/disable control
- Success/error callbacks

---

### `useDebounce` & `useDebouncedCallback`
Debounce values or callbacks to reduce API calls.

```typescript
import { useDebounce, useDebouncedCallback } from '@/shared/hooks';

// Debounce a value
const debouncedSearch = useDebounce(searchTerm, 300);

// Debounce a callback
const debouncedSave = useDebouncedCallback(
  async (value) => await saveToServer(value),
  300
);
```

**Use Cases:**
- Search inputs
- Slider controls
- Form autosave
- Any rapid user input

---

### `useOptimisticUpdate`
Optimistic UI updates with automatic rollback on error.

```typescript
import { useOptimisticUpdate } from '@/shared/hooks';

const {
  displayValue,      // What the UI shows
  value,             // Confirmed value from server
  setValue,          // Update with optimistic feedback
  isPending,         // Is sync in progress?
  hasError,          // Did sync fail?
  retry,             // Retry failed sync
  forceSync,         // Force sync from remote
} = useOptimisticUpdate(
  initialValue,
  async (value) => {
    await apiCall(value);
    return true; // Success
  },
  {
    debounce: 300,
    onError: (error, previousValue) => {
      console.error('Update failed, rolled back to:', previousValue);
    },
  }
);
```

**Features:**
- Instant UI feedback
- Automatic rollback on failure
- Built-in debouncing
- Pending state tracking

---

### `useWindowFocus`
Track window focus and visibility state.

```typescript
import { useWindowFocus } from '@/shared/hooks';

const isFocused = useWindowFocus();

useEffect(() => {
  if (isFocused) {
    // Sync data when user returns to tab
    syncData();
  }
}, [isFocused]);
```

**Use Cases:**
- Sync data when tab becomes active
- Pause animations when tab is hidden
- Save resources when app is not visible

---

## Best Practices

1. **Combine hooks**: Use multiple hooks together for complex patterns
   ```typescript
   const debouncedValue = useDebounce(value, 300);
   usePolling(() => syncWithServer(debouncedValue), { interval: 1500, enabled: true });
   ```

2. **Cleanup**: All hooks handle cleanup automatically - no manual cleanup needed

3. **Type Safety**: All hooks are fully typed with TypeScript

4. **Performance**: Hooks use `useCallback` and `useRef` internally to prevent unnecessary re-renders

---

## Testing

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useDebounce } from '@/shared/hooks';

test('debounces value changes', async () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: 'initial' } }
  );

  expect(result.current).toBe('initial');

  rerender({ value: 'updated' });
  expect(result.current).toBe('initial'); // Not updated yet

  await act(() => new Promise(resolve => setTimeout(resolve, 350)));
  expect(result.current).toBe('updated'); // Now updated
});
```
