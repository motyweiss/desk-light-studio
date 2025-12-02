# Home Assistant API

Unified interface for all Home Assistant operations.

## Overview

This API layer provides:
- Type-safe HTTP requests with retry logic
- WebSocket connections with auto-reconnect
- Entity-specific operations (lights, sensors, media players)
- Consistent error handling

## Components

### HTTP Client

```typescript
import { haClient } from '@/api/homeAssistant';

// Configure client
haClient.setConfig({
  baseUrl: 'http://homeassistant.local:8123',
  accessToken: 'your-long-lived-token'
});

// Test connection
const result = await haClient.testConnection();
console.log(result.success); // true or false

// Get entity state
const entity = await haClient.getEntityState('light.desk_lamp');

// Get all states
const allStates = await haClient.getAllStates();

// Call a service
await haClient.callService('light', 'turn_on', {
  entity_id: 'light.desk_lamp',
  brightness: 128
});
```

**Features:**
- Automatic retry with exponential backoff (up to 5 attempts)
- Skips retry on 4xx errors (client errors)
- Type-safe responses
- Integrated logging

---

### WebSocket Service

```typescript
import { websocketService } from '@/api/homeAssistant';

// Connect
await websocketService.connect({
  baseUrl: 'http://homeassistant.local:8123',
  accessToken: 'your-token'
});

// Subscribe to entity changes
const unsubscribe = websocketService.subscribe(
  'light.desk_lamp',
  (state) => console.log('Light changed:', state)
);

// Get current state
const state = await websocketService.getEntityState('light.desk_lamp');

// Disconnect
websocketService.disconnect();

// Cleanup subscription
unsubscribe();
```

**Features:**
- Real-time state updates
- Auto-reconnection with exponential backoff
- Multiple subscribers per entity
- Connection status tracking

---

### Entity APIs

#### Lights

```typescript
import { lights } from '@/api/homeAssistant';

// Turn on
await lights.turnOn('light.desk_lamp');

// Turn on with brightness
await lights.turnOn('light.desk_lamp', 75); // 75%

// Turn off
await lights.turnOff('light.desk_lamp');

// Set brightness
await lights.setBrightness('light.desk_lamp', 50); // 50%

// Toggle
await lights.toggle('light.desk_lamp');

// Get state
const state = await lights.getState('light.desk_lamp');
console.log(state.state); // 'on' or 'off'
console.log(state.attributes.brightness); // 0-255
```

#### Sensors

```typescript
import { sensors } from '@/api/homeAssistant';

// Get sensor state
const state = await sensors.getState('sensor.temperature');

// Get numeric value
const temp = await sensors.getValue('sensor.temperature');
console.log(temp); // 22.5

// Get multiple sensors at once
const states = await sensors.getMultipleStates([
  'sensor.temperature',
  'sensor.humidity',
  'sensor.air_quality'
]);
```

#### Media Player

```typescript
import { mediaPlayer } from '@/api/homeAssistant';

// Playback controls
await mediaPlayer.play('media_player.spotify');
await mediaPlayer.pause('media_player.spotify');
await mediaPlayer.nextTrack('media_player.spotify');
await mediaPlayer.previousTrack('media_player.spotify');

// Volume
await mediaPlayer.setVolume('media_player.spotify', 0.7); // 70%
await mediaPlayer.setMute('media_player.spotify', true);

// Playback options
await mediaPlayer.setShuffle('media_player.spotify', true);
await mediaPlayer.setRepeat('media_player.spotify', 'all');

// Source selection
await mediaPlayer.selectSource('media_player.spotify', 'Living Room');

// Speaker grouping
await mediaPlayer.joinSpeakers(
  'media_player.sonos_arc',      // Master
  ['media_player.sonos_play_5']  // Slaves
);

await mediaPlayer.unjoinSpeaker('media_player.sonos_play_5');

// Get state
const state = await mediaPlayer.getState('media_player.spotify');

// Get available players
const players = await mediaPlayer.getAvailablePlayers();
```

---

## Error Handling

All API calls include automatic error handling:

```typescript
try {
  await lights.turnOn('light.desk_lamp');
} catch (error) {
  // Error is logged automatically
  // Retry logic already applied
  console.error('Failed after retries:', error);
}
```

## Logging

All operations are automatically logged in development mode:

```typescript
// Logs appear as:
// 🔌 HA client configured
// 💡 [desk_lamp] Turned on (brightness: 75)
// 🎵 Synced: Playing - Bohemian Rhapsody
// ❌ Failed to sync light desk_lamp
```

## Type Safety

All responses are fully typed:

```typescript
import type {
  HAEntity,
  HALightEntity,
  HASensorEntity,
  HAMediaPlayerEntity,
  ConnectionResult,
} from '@/api/homeAssistant';

const light: HALightEntity = await lights.getState('light.desk_lamp');
// TypeScript knows all available properties!
```

## Best Practices

1. **Always configure client first:**
   ```typescript
   haClient.setConfig(config);
   ```

2. **Use entity-specific APIs:**
   ```typescript
   // ✅ Good
   await lights.turnOn('light.desk_lamp');
   
   // ❌ Avoid
   await haClient.callService('light', 'turn_on', { entity_id: '...' });
   ```

3. **Handle errors gracefully:**
   ```typescript
   try {
     await lights.turnOn('light.desk_lamp');
   } catch {
     // Show user feedback
   }
   ```

4. **Use WebSocket for real-time:**
   ```typescript
   // For real-time updates, prefer WebSocket
   websocketService.subscribe('light.desk_lamp', handleUpdate);
   
   // For one-time fetches, use HTTP
   const state = await lights.getState('light.desk_lamp');
   ```

---

**See also:** [REFACTORING.md](../../../REFACTORING.md) for complete architecture overview.
