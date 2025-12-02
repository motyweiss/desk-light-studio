import { vi } from 'vitest';
import type { HAEntity, HAMediaPlayerEntity } from '@/api/homeAssistant/types';

/**
 * Mock Home Assistant entities for testing
 */

export const mockLightEntity: HAEntity = {
  entity_id: 'light.test_light',
  state: 'on',
  attributes: {
    brightness: 200,
    friendly_name: 'Test Light',
  },
  last_changed: new Date().toISOString(),
  last_updated: new Date().toISOString(),
};

export const mockSensorEntity: HAEntity = {
  entity_id: 'sensor.test_temperature',
  state: '22.5',
  attributes: {
    unit_of_measurement: '°C',
    friendly_name: 'Test Temperature',
  },
  last_changed: new Date().toISOString(),
  last_updated: new Date().toISOString(),
};

export const mockMediaPlayerEntity: HAMediaPlayerEntity = {
  entity_id: 'media_player.test_player',
  state: 'playing',
  attributes: {
    media_title: 'Test Track',
    media_artist: 'Test Artist',
    media_album_name: 'Test Album',
    media_position: 30,
    media_duration: 180,
    media_position_updated_at: new Date().toISOString(),
    volume_level: 0.5,
    is_volume_muted: false,
    shuffle: false,
    repeat: 'off',
    source: 'Spotify',
    source_list: ['Spotify', 'AirPlay'],
    friendly_name: 'Test Player',
  },
  last_changed: new Date().toISOString(),
  last_updated: new Date().toISOString(),
};

/**
 * Mock Home Assistant client
 */
export const mockHAClient = {
  setConfig: vi.fn(),
  getConfig: vi.fn(),
  testConnection: vi.fn(),
  getEntityState: vi.fn(),
  getAllStates: vi.fn(),
  callService: vi.fn(),
};

/**
 * Mock WebSocket service
 */
export const mockWebSocketService = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  subscribe: vi.fn(),
  getEntityState: vi.fn(),
  isConnected: vi.fn(),
  isReconnecting: vi.fn(),
};
