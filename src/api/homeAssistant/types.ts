/**
 * Home Assistant API types
 */

export interface HAConfig {
  baseUrl: string;
  accessToken: string;
}

export interface HAEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export interface HALightEntity extends HAEntity {
  attributes: {
    brightness?: number;
    color_temp?: number;
    rgb_color?: [number, number, number];
    supported_features?: number;
    friendly_name?: string;
  };
}

export interface HASensorEntity extends HAEntity {
  attributes: {
    unit_of_measurement?: string;
    device_class?: string;
    friendly_name?: string;
  };
}

export interface HAMediaPlayerEntity extends HAEntity {
  attributes: {
    media_content_type?: string;
    media_duration?: number;
    media_position?: number;
    media_position_updated_at?: string;
    media_title?: string;
    media_artist?: string;
    media_album_name?: string;
    entity_picture?: string;
    volume_level?: number;
    is_volume_muted?: boolean;
    shuffle?: boolean;
    repeat?: string;
    source?: string;
    source_list?: string[];
    supported_features?: number;
    friendly_name?: string;
    group_members?: string[];
    app_name?: string;
  };
}

export interface ConnectionResult {
  success: boolean;
  message: string;
  version?: string;
}

export interface StateChangeCallback {
  (entity: HAEntity): void;
}

export type EntityType = 'light' | 'sensor' | 'media_player' | 'switch' | 'binary_sensor';
