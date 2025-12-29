import { haProxyClient } from '@/services/haProxyClient';
import type { HAMediaPlayerEntity } from '../types';
import { logger } from '@/shared/utils/logger';

/**
 * Media Player entity operations
 * Uses haProxyClient for consistent connection handling
 */

export const mediaPlayer = {
  /**
   * Play media
   */
  async play(entityId: string): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/media_play', { entity_id: entityId });
    if (error) {
      logger.error(`Failed to play ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Play: ${entityId}`);
  },

  /**
   * Pause media
   */
  async pause(entityId: string): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/media_pause', { entity_id: entityId });
    if (error) {
      logger.error(`Failed to pause ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Pause: ${entityId}`);
  },

  /**
   * Stop media
   */
  async stop(entityId: string): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/media_stop', { entity_id: entityId });
    if (error) {
      logger.error(`Failed to stop ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Stop: ${entityId}`);
  },

  /**
   * Next track
   */
  async nextTrack(entityId: string): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/media_next_track', { entity_id: entityId });
    if (error) {
      logger.error(`Failed to next track ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Next track: ${entityId}`);
  },

  /**
   * Previous track
   */
  async previousTrack(entityId: string): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/media_previous_track', { entity_id: entityId });
    if (error) {
      logger.error(`Failed to previous track ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Previous track: ${entityId}`);
  },

  /**
   * Set volume
   */
  async setVolume(entityId: string, volumeLevel: number): Promise<void> {
    const normalizedVolume = Math.max(0, Math.min(1, volumeLevel));
    const { error } = await haProxyClient.post('/api/services/media_player/volume_set', {
      entity_id: entityId,
      volume_level: normalizedVolume,
    });
    if (error) {
      logger.error(`Failed to set volume for ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Set volume to ${Math.round(normalizedVolume * 100)}%`);
  },

  /**
   * Mute/unmute
   */
  async setMute(entityId: string, isMuted: boolean): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/volume_mute', {
      entity_id: entityId,
      is_volume_muted: isMuted,
    });
    if (error) {
      logger.error(`Failed to set mute for ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Mute: ${isMuted}`);
  },

  /**
   * Set shuffle
   */
  async setShuffle(entityId: string, shuffle: boolean): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/shuffle_set', {
      entity_id: entityId,
      shuffle,
    });
    if (error) {
      logger.error(`Failed to set shuffle for ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Shuffle: ${shuffle}`);
  },

  /**
   * Set repeat mode
   */
  async setRepeat(entityId: string, repeat: string): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/repeat_set', {
      entity_id: entityId,
      repeat,
    });
    if (error) {
      logger.error(`Failed to set repeat for ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Repeat: ${repeat}`);
  },

  /**
   * Seek to position
   */
  async seek(entityId: string, position: number): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/media_seek', {
      entity_id: entityId,
      seek_position: position,
    });
    if (error) {
      logger.error(`Failed to seek for ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Seek to ${position}s`);
  },

  /**
   * Select source
   */
  async selectSource(entityId: string, source: string): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/select_source', {
      entity_id: entityId,
      source,
    });
    if (error) {
      logger.error(`Failed to select source for ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Select source: ${source}`);
  },

  /**
   * Join speakers
   */
  async joinSpeakers(masterEntityId: string, slaveEntityIds: string[]): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/join', {
      entity_id: masterEntityId,
      group_members: slaveEntityIds,
    });
    if (error) {
      logger.error(`Failed to join speakers`, error);
      throw new Error(error);
    }
    logger.media(`Join speakers: ${slaveEntityIds.join(', ')} -> ${masterEntityId}`);
  },

  /**
   * Unjoin speaker
   */
  async unjoinSpeaker(entityId: string): Promise<void> {
    const { error } = await haProxyClient.post('/api/services/media_player/unjoin', { entity_id: entityId });
    if (error) {
      logger.error(`Failed to unjoin speaker ${entityId}`, error);
      throw new Error(error);
    }
    logger.media(`Unjoin speaker: ${entityId}`);
  },

  /**
   * Get media player state
   */
  async getState(entityId: string): Promise<HAMediaPlayerEntity | null> {
    const { data, error } = await haProxyClient.get<HAMediaPlayerEntity>(`/api/states/${entityId}`);
    if (error || !data) {
      logger.error(`Failed to get state for ${entityId}`, error);
      return null;
    }
    return data;
  },

  /**
   * Get available media players
   */
  async getAvailablePlayers(): Promise<HAMediaPlayerEntity[]> {
    const { data, error } = await haProxyClient.get<HAMediaPlayerEntity[]>('/api/states');
    if (error || !data) {
      logger.error('Failed to get all states', error);
      return [];
    }
    return data.filter(
      entity => entity.entity_id.startsWith('media_player.')
    );
  },
};
