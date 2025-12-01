// Room vocabulary for multi-language room detection
// English and Hebrew room names with common variations

export interface RoomPattern {
  key: string;
  englishNames: string[];
  hebrewNames: string[];
  entityPatterns: RegExp[];
}

export const ROOM_VOCABULARY: RoomPattern[] = [
  {
    key: 'living_room',
    englishNames: ['living room', 'living', 'lounge', 'family room', 'great room', 'salon'],
    hebrewNames: ['סלון', 'חדר מגורים'],
    entityPatterns: [/living/i, /lounge/i, /salon/i],
  },
  {
    key: 'bedroom',
    englishNames: ['bedroom', 'master bedroom', 'guest room', 'kids room', 'children room', 'bed'],
    hebrewNames: ['חדר שינה', 'חדר הורים', 'חדר אורחים', 'חדר ילדים', 'שינה'],
    entityPatterns: [/bedroom/i, /bed_room/i, /master/i, /guest/i],
  },
  {
    key: 'kitchen',
    englishNames: ['kitchen', 'kitchenette'],
    hebrewNames: ['מטבח'],
    entityPatterns: [/kitchen/i],
  },
  {
    key: 'bathroom',
    englishNames: ['bathroom', 'bath', 'toilet', 'wc', 'restroom', 'washroom'],
    hebrewNames: ['חדר אמבטיה', 'שירותים', 'מקלחת', 'אמבטיה'],
    entityPatterns: [/bathroom/i, /bath_room/i, /toilet/i, /wc/i],
  },
  {
    key: 'office',
    englishNames: ['office', 'study', 'home office', 'workspace', 'den', 'work'],
    hebrewNames: ['משרד', 'חדר עבודה', 'סטודיו', 'עבודה'],
    entityPatterns: [/office/i, /study/i, /work/i],
  },
  {
    key: 'dining',
    englishNames: ['dining room', 'dining', 'eat-in', 'dining area'],
    hebrewNames: ['פינת אוכל', 'חדר אוכל', 'אוכל'],
    entityPatterns: [/dining/i, /eat/i],
  },
  {
    key: 'garage',
    englishNames: ['garage', 'carport', 'car'],
    hebrewNames: ['מוסך', 'חניה'],
    entityPatterns: [/garage/i, /carport/i],
  },
  {
    key: 'outdoor',
    englishNames: ['outdoor', 'patio', 'deck', 'garden', 'yard', 'balcony', 'terrace', 'outside'],
    hebrewNames: ['מרפסת', 'גינה', 'חצר', 'מרפסת גג', 'חוץ'],
    entityPatterns: [/outdoor/i, /patio/i, /garden/i, /balcony/i, /terrace/i, /yard/i],
  },
  {
    key: 'basement',
    englishNames: ['basement', 'cellar'],
    hebrewNames: ['מרתף'],
    entityPatterns: [/basement/i, /cellar/i],
  },
  {
    key: 'attic',
    englishNames: ['attic', 'loft'],
    hebrewNames: ['עליית גג', 'גג'],
    entityPatterns: [/attic/i, /loft/i],
  },
  {
    key: 'laundry',
    englishNames: ['laundry', 'utility', 'mudroom', 'laundry room'],
    hebrewNames: ['מכבסה', 'חדר כביסה'],
    entityPatterns: [/laundry/i, /utility/i, /mudroom/i],
  },
  {
    key: 'hallway',
    englishNames: ['hallway', 'hall', 'corridor', 'foyer', 'entrance', 'entry'],
    hebrewNames: ['מסדרון', 'כניסה', 'מבואה'],
    entityPatterns: [/hall/i, /corridor/i, /foyer/i, /entrance/i, /entry/i],
  },
  {
    key: 'nursery',
    englishNames: ['nursery', 'baby room'],
    hebrewNames: ['חדר תינוק', 'תינוק'],
    entityPatterns: [/nursery/i, /baby/i],
  },
];

// Helper function to normalize room names
export function normalizeRoomName(name: string): string {
  return name.toLowerCase().trim();
}

// Check if a text matches any room pattern
export function matchRoomPattern(text: string): RoomPattern | null {
  const normalized = normalizeRoomName(text);
  
  for (const room of ROOM_VOCABULARY) {
    // Check English names
    if (room.englishNames.some(name => normalized.includes(name.toLowerCase()))) {
      return room;
    }
    
    // Check Hebrew names
    if (room.hebrewNames.some(name => text.includes(name))) {
      return room;
    }
    
    // Check entity patterns
    if (room.entityPatterns.some(pattern => pattern.test(text))) {
      return room;
    }
  }
  
  return null;
}

// Get preferred display name for a room (English by default)
export function getRoomDisplayName(pattern: RoomPattern, locale: 'en' | 'he' = 'en'): string {
  if (locale === 'he' && pattern.hebrewNames.length > 0) {
    return pattern.hebrewNames[0];
  }
  return pattern.englishNames[0]
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
