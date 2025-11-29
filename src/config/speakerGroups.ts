export interface SpeakerGroup {
  id: string;
  name: string;
  entityIds: string[];
  masterEntityId: string;
  isDefault?: boolean;
}

export const PREDEFINED_GROUPS: SpeakerGroup[] = [
  {
    id: 'arc_sofa',
    name: 'Arc + Sofa',
    entityIds: ['media_player.sonos_arc', 'media_player.sofa_speaker'],
    masterEntityId: 'media_player.sonos_arc',
    isDefault: true,
  },
];

// Map friendly names to entity_ids
export const SPEAKER_ENTITY_MAP: Record<string, string> = {
  'Sonos Arc': 'media_player.sonos_arc',
  'Sofa Speaker': 'media_player.sofa_speaker',
  'Sonos Play 5': 'media_player.sonos_play_5',
  'Outdoor': 'media_player.outdoor',
};

export interface PlaybackTarget {
  type: 'spotify' | 'speaker' | 'group';
  name: string;
  entityIds: string[];
  groupId?: string;
}
