/**
 * Home Assistant API
 * Unified interface for all Home Assistant operations
 */

export { haClient } from './client';
export { lights } from './entities/lights';
export { sensors } from './entities/sensors';
export { mediaPlayer } from './entities/mediaPlayer';

export type {
  HAConfig,
  HAEntity,
  HALightEntity,
  HASensorEntity,
  HAMediaPlayerEntity,
  ConnectionResult,
  StateChangeCallback,
  EntityType,
} from './types';
