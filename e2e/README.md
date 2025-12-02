# E2E Tests (Playwright)

End-to-end tests for critical user journeys using Playwright.

## Test Coverage

### Light Control (`light-control.spec.ts`)
- Room title and climate data display
- Three light control cards rendering
- Toggle lights on/off via control cards
- Adjust light intensity using sliders
- Master switch functionality
- Desk image with lighting states
- Keyboard shortcuts (1-3 for lights, spacebar for master)
- Mobile layout (vertical stack, hidden settings)

### Media Player (`media-player.spec.ts`)
- Media player visibility when music is playing
- Album art display
- Track information (title, artist, album)
- Playback controls (play/pause, next/previous)
- Volume control slider
- Toggle between mini and full mode
- Spotify logo branding
- Progress bar with seek functionality
- Mobile layout

### Settings (`settings.spec.ts`)
- Connection status indicator display
- Settings dialog open/close
- Home Assistant configuration fields (URL, token)
- Entity mapping section
- Connection status tooltip
- Desktop-only settings button visibility
- Mobile settings hiding

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/light-control.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Debug mode
npx playwright test --debug
```

## Test Configuration

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:8080`
- **Retries**: 2 in CI, 0 locally
- **Parallel**: Yes (1 worker in CI)
- **Artifacts**: Screenshots on failure, video on failure, trace on first retry

## Writing Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    const element = page.locator('selector');
    await expect(element).toBeVisible();
  });
});
```

## Best Practices

1. **Wait for network idle** after navigation
2. **Use semantic selectors** (text, role, label) over CSS selectors
3. **Check visibility gracefully** with `.catch(() => false)` for optional elements
4. **Add timeouts** for animations and transitions
5. **Test mobile layouts** with viewport configuration
6. **Use descriptive test names** that explain the expected behavior
7. **Isolate tests** - each test should be independent

## CI Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Manual workflow dispatch

See `.github/workflows/ci.yml` for CI configuration.
