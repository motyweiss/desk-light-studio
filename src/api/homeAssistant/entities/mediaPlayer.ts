import { haClient } from '../client';
import type { HAMediaPlayerEntity } from '../types';
import { logger } from '@/shared/utils/logger';

/**
 * Media Player entity operations
 */

export const mediaPlayer = {
  /**
   * Play media
   */
  async play(entityId: string): Promise<void> {
    await haClient.callService('media_player', 'media_play', { entity_id: entityId });
    logger.media(`Play: ${entityId}`);
  },

  /**
   * Pause media
   */
  async pause(entityId: string): Promise<void> {
    await haClient.callService('media_player', 'media_pause', { entity_id: entityId });
    logger.media(`Pause: ${entityId}`);
  },

  /**
   * Stop media
   */
  async stop(entityId: string): Promise<void> {
    await haClient.callService('media_player', 'media_stop', { entity_id: entityId });
    logger.media(`Stop: ${entityId}`);
  },

  /**
   * Next track
   */
  async nextTrack(entityId: string): Promise<void> {
    await haClient.callService('media_player', 'media_next_track', { entity_id: entityId });
    logger.media(`Next track: ${entityId}`);
  },

  /**
   * Previous track
   */
  async previousTrack(entityId: string): Promise<void> {
    await haClient.callService('media_player', 'media_previous_track', { entity_id: entityId });
    logger.media(`Previous track: ${entityId}`);
  },

  /**
   * Set volume
   */
  async setVolume(entityId: string, volumeLevel: number): Promise<void> {
    const normalizedVolume = Math.max(0, Math.min(1, volumeLevel));
    await haClient.callService('media_player', 'volume_set', {
      entity_id: entityId,
      volume_level: normalizedVolume,
    });
    logger.media(`Set volume to ${Math.round(normalizedVolume * 100)}%`);
  },

  /**
   * Mute/unmute
   */
  async setMute(entityId: string, isMuted: boolean): Promise<void> {
    await haClient.callService('media_player', 'volume_mute', {
      entity_id: entityId,
      is_volume_muted: isMuted,
    });
    logger.media(`Mute: ${isMuted}`);
  },

  /**
   * Set shuffle
   */
  async setShuffle(entityId: string, shuffle: boolean): Promise<void> {
    await haClient.callService('media_player', 'shuffle_set', {
      entity_id: entityId,
      shuffle,
    });
    logger.media(`Shuffle: ${shuffle}`);
  },

  /**
   * Set repeat mode
   */
  async setRepeat(entityId: string, repeat: string): Promise<void> {
    await haClient.callService('media_player', 'repeat_set', {
      entity_id: entityId,
      repeat,
    });
    logger.media(`Repeat: ${repeat}`);
  },

  /**
   * Seek to position
   */
  async seek(entityId: string, position: number): Promise<void> {
    await haClient.callService('media_player', 'media_seek', {
      entity_id: entityId,
      seek_position: position,
    });
    logger.media(`Seek to ${position}s`);
  },

  /**
   * Select source
   */
  async selectSource(entityId: string, source: string): Promise<void> {
    await haClient.callService('media_player', 'select_source', {
      entity_id: entityId,
      source,
    });
    logger.media(`Select source: ${source}`);
  },

  /**
   * Join speakers
   */
  async joinSpeakers(masterEntityId: string, slaveEntityIds: string[]): Promise<void> {
    await haClient.callService('media_player', 'join', {
      entity_id: masterEntityId,
      group_members: slaveEntityIds,
    });
    logger.media(`Join speakers: ${slaveEntityIds.join(', ')} -> ${masterEntityId}`);
  },

  /**
   * Unjoin speaker
   */
  async unjoinSpeaker(entityId: string): Promise<void> {
    await haClient.callService('media_player', 'unjoin', { entity_id: entityId });
    logger.media(`Unjoin speaker: ${entityId}`);
  },

  /**
   * Get media player state
   */
  async getState(entityId: string): Promise<HAMediaPlayerEntity | null> {
    const entity = await haClient.getEntityState(entityId);
    return entity as HAMediaPlayerEntity | null;
  },

  /**
   * Get available media players
   */
  async getAvailablePlayers(): Promise<HAMediaPlayerEntity[]> {
    const allStates = await haClient.getAllStates();
    return allStates.filter(
      entity => entity.entity_id.startsWith('media_player.')
    ) as HAMediaPlayerEntity[];
  },
};
