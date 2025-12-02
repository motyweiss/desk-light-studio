# MSW (Mock Service Worker)

Mock Service Worker setup for testing and development without real Home Assistant connection.

## Files

- **`handlers.ts`**: Mock API response handlers for Home Assistant endpoints
- **`server.ts`**: MSW server setup for Node.js (tests)
- **`browser.ts`**: MSW worker setup for browser (Storybook, development)

## Mocked Endpoints

### Lights
- `GET /api/states/light.go` - Desk Lamp state
- `GET /api/states/light.screen` - Monitor Light state
- `GET /api/states/light.door` - Spotlight state
- `POST /api/services/light/turn_on` - Turn on light with brightness
- `POST /api/services/light/turn_off` - Turn off light

### Sensors
- `GET /api/states/sensor.dyson_pure_temperature` - Temperature sensor
- `GET /api/states/sensor.dyson_pure_humidity` - Humidity sensor
- `GET /api/states/sensor.dyson_pure_pm_2_5` - Air quality sensor
- `GET /api/states/sensor.motys_iphone_battery_level` - Battery level
- `GET /api/states/sensor.motys_iphone_battery_state` - Charging state

### Media Player
- `GET /api/states/media_player.spotify` - Spotify player state
- `POST /api/services/media_player/*` - Media player controls

## Usage in Tests

MSW is automatically enabled in all tests via `src/test/setup.ts`:

```typescript
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Override Handlers in Tests

```typescript
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

test('custom response', () => {
  server.use(
    http.get('/api/states/light.go', () => {
      return HttpResponse.json({
        entity_id: 'light.go',
        state: 'off',
        attributes: { brightness: 0 },
      });
    })
  );

  // Test with custom response
});
```

## Usage in Storybook

Enable MSW in Storybook for interactive component development:

```typescript
// .storybook/preview.tsx
import { worker } from '../src/test/mocks/browser';

if (typeof window !== 'undefined') {
  worker.start();
}
```

## Adding New Endpoints

1. Add handler to `handlers.ts`:

```typescript
export const handlers = [
  // ... existing handlers
  http.get('/api/states/new_entity', () => {
    return HttpResponse.json({
      entity_id: 'new_entity',
      state: 'value',
      attributes: {},
    });
  }),
];
```

2. Use in tests - handlers are automatically included

## Benefits

- ✅ Tests run without real Home Assistant connection
- ✅ Fast, reliable, deterministic tests
- ✅ Develop components in Storybook without backend
- ✅ Simulate edge cases and error states
- ✅ No API rate limits or network issues
