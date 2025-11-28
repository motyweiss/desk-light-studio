export interface MediaPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isIdle: boolean;
  isOff: boolean;
  volume: number;
  isMuted: boolean;
  currentTrack: {
    title: string;
    artist: string;
    album: string;
    albumArt: string | null;
    duration: number;
    position: number;
  } | null;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  source: string;
  availableSources: string[];
  groupedSpeakers: string[];
  appName: string | null;
  isPending: boolean;
  isLoading: boolean;
  entityId: string;
}

export interface MediaPlayerEntity {
  entity_id: string;
  state: 'playing' | 'paused' | 'idle' | 'off' | 'standby';
  attributes: {
    friendly_name?: string;
    volume_level?: number;
    is_volume_muted?: boolean;
    media_title?: string;
    media_artist?: string;
    media_album_name?: string;
    entity_picture?: string;
    media_duration?: number;
    media_position?: number;
    media_position_updated_at?: string;
    shuffle?: boolean;
    repeat?: 'off' | 'one' | 'all';
    source?: string;
    source_list?: string[];
    group_members?: string[];
    app_name?: string;
  };
}
