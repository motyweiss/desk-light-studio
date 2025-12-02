# Testing Guide

## Overview

This project uses **Vitest** as the testing framework with **React Testing Library** for component tests. The testing setup provides fast, modern testing with excellent TypeScript support.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

## Test Structure

```
src/
├── test/
│   ├── setup.ts              # Global test setup
│   ├── helpers/              # Test utilities
│   │   └── renderWithProviders.tsx
│   └── mocks/                # Mock data and services
│       └── homeAssistant.ts
│
├── shared/hooks/
│   ├── usePolling.ts
│   └── usePolling.test.ts    # Tests alongside implementation
│
└── api/homeAssistant/
    ├── client.ts
    └── client.test.ts        # Tests alongside implementation
```

## Writing Tests

### Unit Tests (Hooks)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePolling } from './usePolling';

describe('usePolling', () => {
  it('should poll at specified interval', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    
    renderHook(() =>
      usePolling(fetcher, {
        interval: 1000,
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalled();
    });
  });
});
```

### API Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { haClient } from './client';

describe('HomeAssistantClient', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should fetch entity state', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entity_id: 'light.test', state: 'on' }),
    });

    const entity = await haClient.getEntityState('light.test');
    expect(entity?.state).toBe('on');
  });
});
```

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/test/helpers/renderWithProviders';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Testing Patterns

### 1. Mocking Timers

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('should debounce', () => {
  // Test with vi.advanceTimersByTime()
});
```

### 2. Mocking Fetch

```typescript
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'test' }),
});
```

### 3. Testing Async Hooks

```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(result.current.data).toBeDefined();
});
```

### 4. Testing Error Handling

```typescript
const error = new Error('Test error');
const fetcher = vi.fn().mockRejectedValue(error);
const onError = vi.fn();

// ... use hook with onError callback

await waitFor(() => {
  expect(onError).toHaveBeenCalledWith(error);
});
```

## Test Utilities

### renderWithProviders

Renders components with all necessary providers (QueryClient, etc.):

```typescript
import { renderWithProviders } from '@/test/helpers/renderWithProviders';

renderWithProviders(<MyComponent />);
```

### Mock Data

Use predefined mocks from `src/test/mocks/`:

```typescript
import { mockLightEntity, mockHAClient } from '@/test/mocks/homeAssistant';
```

## Coverage Goals

- **Shared Hooks**: 90%+ coverage
- **API Layer**: 80%+ coverage
- **Utils**: 90%+ coverage
- **Components**: 70%+ coverage
- **Overall**: 75%+ coverage

## Best Practices

1. **Co-locate tests**: Keep test files next to implementation
2. **Descriptive names**: Use clear `describe` and `it` blocks
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock external dependencies**: Use `vi.fn()` for mocks
5. **Test behavior, not implementation**: Focus on what, not how
6. **Cleanup**: Always cleanup after tests
7. **Async handling**: Use `waitFor` for async operations
8. **Type safety**: Leverage TypeScript in tests

## Common Pitfalls

❌ **Don't**: Test implementation details
```typescript
expect(component.state.count).toBe(1); // Bad
```

✅ **Do**: Test user-facing behavior
```typescript
expect(screen.getByText('Count: 1')).toBeInTheDocument(); // Good
```

❌ **Don't**: Forget to cleanup timers
```typescript
beforeEach(() => vi.useFakeTimers());
// Missing afterEach cleanup
```

✅ **Do**: Always cleanup
```typescript
afterEach(() => vi.useRealTimers());
```

## Continuous Integration

Tests run automatically on:
- Pre-commit (via git hooks)
- Pull requests
- Main branch pushes

All tests must pass before merging.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
