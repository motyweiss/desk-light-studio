import { DiscoveredDevice, DiscoveredArea } from '@/types/discovery';
import { matchRoomPattern, getRoomDisplayName, normalizeRoomName } from '@/config/roomVocabulary';

export type AssignmentSource = 'ha_registry' | 'entity_id' | 'friendly_name' | 'learned' | 'device_group' | 'unknown';

export interface AssignmentResult {
  deviceId: string;
  areaId: string | null;
  areaName: string | null;
  confidence: number; // 0-100
  source: AssignmentSource;
  reasoning?: string;
}

export interface LearnedPattern {
  pattern: string; // manufacturer, model, or name pattern
  areaId: string;
  areaName: string;
  matchCount: number;
}

export class AutoAssignmentService {
  private learnedPatterns: Map<string, LearnedPattern> = new Map();

  constructor(learnedPatterns?: LearnedPattern[]) {
    if (learnedPatterns) {
      learnedPatterns.forEach(pattern => {
        this.learnedPatterns.set(pattern.pattern, pattern);
      });
    }
  }

  /**
   * Layer 1: Check if device has area_id from Home Assistant registry (100% confidence)
   */
  private checkHAAreaId(device: DiscoveredDevice, haAreas: DiscoveredArea[]): AssignmentResult | null {
    // Check if device already has area_id and area_name from HA
    if (device.area_id && device.area_name) {
      // Try to match with our areas
      const matchedArea = haAreas.find(area => 
        area.id === device.area_id || 
        normalizeRoomName(area.name) === normalizeRoomName(device.area_name!)
      );

      if (matchedArea) {
        return {
          deviceId: device.id,
          areaId: matchedArea.id,
          areaName: matchedArea.name,
          confidence: 100,
          source: 'ha_registry',
          reasoning: `Direct assignment from Home Assistant: ${device.area_name}`,
        };
      }

      // Even if we don't have a matching area, trust HA's assignment
      return {
        deviceId: device.id,
        areaId: device.area_id,
        areaName: device.area_name,
        confidence: 100,
        source: 'ha_registry',
        reasoning: `Direct assignment from Home Assistant: ${device.area_name}`,
      };
    }

    // Check entities for area_id
    for (const entity of device.entities) {
      if (entity.attributes?.area_id) {
        const areaId = entity.attributes.area_id as string;
        const matchedArea = haAreas.find(area => area.id === areaId);
        
        if (matchedArea) {
          return {
            deviceId: device.id,
            areaId: matchedArea.id,
            areaName: matchedArea.name,
            confidence: 100,
            source: 'ha_registry',
            reasoning: `Entity ${entity.entity_id} has area_id from HA`,
          };
        }
      }
    }

    return null;
  }

  /**
   * Layer 2: Parse entity_id for room patterns (85% confidence)
   */
  private parseEntityId(device: DiscoveredDevice, haAreas: DiscoveredArea[]): AssignmentResult | null {
    // Check primary entity first
    const primaryEntity = device.entities.find(e => e.entity_id === device.primaryEntity) || device.entities[0];
    
    if (primaryEntity) {
      const entityId = primaryEntity.entity_id;
      const roomPattern = matchRoomPattern(entityId);
      
      if (roomPattern) {
        const displayName = getRoomDisplayName(roomPattern);
        
        // Try to find matching area
        const matchedArea = haAreas.find(area => 
          normalizeRoomName(area.name) === normalizeRoomName(displayName) ||
          roomPattern.englishNames.some(name => normalizeRoomName(area.name).includes(name.toLowerCase()))
        );

        return {
          deviceId: device.id,
          areaId: matchedArea?.id || null,
          areaName: matchedArea?.name || displayName,
          confidence: 85,
          source: 'entity_id',
          reasoning: `Entity ID "${entityId}" matches room pattern "${displayName}"`,
        };
      }
    }

    // Check all entities
    for (const entity of device.entities) {
      const roomPattern = matchRoomPattern(entity.entity_id);
      if (roomPattern) {
        const displayName = getRoomDisplayName(roomPattern);
        const matchedArea = haAreas.find(area => 
          normalizeRoomName(area.name) === normalizeRoomName(displayName)
        );

        return {
          deviceId: device.id,
          areaId: matchedArea?.id || null,
          areaName: matchedArea?.name || displayName,
          confidence: 80,
          source: 'entity_id',
          reasoning: `Entity ID "${entity.entity_id}" matches room pattern "${displayName}"`,
        };
      }
    }

    return null;
  }

  /**
   * Layer 3: Parse friendly name for room patterns (70% confidence)
   */
  private parseFriendlyName(device: DiscoveredDevice, haAreas: DiscoveredArea[]): AssignmentResult | null {
    // Check device name
    const devicePattern = matchRoomPattern(device.name);
    if (devicePattern) {
      const displayName = getRoomDisplayName(devicePattern);
      const matchedArea = haAreas.find(area => 
        normalizeRoomName(area.name) === normalizeRoomName(displayName)
      );

      return {
        deviceId: device.id,
        areaId: matchedArea?.id || null,
        areaName: matchedArea?.name || displayName,
        confidence: 75,
        source: 'friendly_name',
        reasoning: `Device name "${device.name}" matches room pattern "${displayName}"`,
      };
    }

    // Check entity friendly names
    for (const entity of device.entities) {
      const entityPattern = matchRoomPattern(entity.friendly_name);
      if (entityPattern) {
        const displayName = getRoomDisplayName(entityPattern);
        const matchedArea = haAreas.find(area => 
          normalizeRoomName(area.name) === normalizeRoomName(displayName)
        );

        return {
          deviceId: device.id,
          areaId: matchedArea?.id || null,
          areaName: matchedArea?.name || displayName,
          confidence: 70,
          source: 'friendly_name',
          reasoning: `Entity "${entity.friendly_name}" matches room pattern "${displayName}"`,
        };
      }
    }

    return null;
  }

  /**
   * Layer 4: Check learned patterns from user behavior (60% confidence)
   */
  private checkLearnedPatterns(device: DiscoveredDevice, haAreas: DiscoveredArea[]): AssignmentResult | null {
    // Check manufacturer pattern
    if (device.manufacturer) {
      const pattern = this.learnedPatterns.get(`manufacturer:${device.manufacturer.toLowerCase()}`);
      if (pattern) {
        return {
          deviceId: device.id,
          areaId: pattern.areaId,
          areaName: pattern.areaName,
          confidence: 60,
          source: 'learned',
          reasoning: `Learned: ${device.manufacturer} devices → ${pattern.areaName} (${pattern.matchCount} matches)`,
        };
      }
    }

    // Check model pattern
    if (device.model) {
      const pattern = this.learnedPatterns.get(`model:${device.model.toLowerCase()}`);
      if (pattern) {
        return {
          deviceId: device.id,
          areaId: pattern.areaId,
          areaName: pattern.areaName,
          confidence: 65,
          source: 'learned',
          reasoning: `Learned: ${device.model} model → ${pattern.areaName} (${pattern.matchCount} matches)`,
        };
      }
    }

    // Check name pattern (first word)
    const firstWord = device.name.split(' ')[0].toLowerCase();
    if (firstWord.length > 2) {
      const pattern = this.learnedPatterns.get(`name:${firstWord}`);
      if (pattern) {
        return {
          deviceId: device.id,
          areaId: pattern.areaId,
          areaName: pattern.areaName,
          confidence: 55,
          source: 'learned',
          reasoning: `Learned: Names starting with "${firstWord}" → ${pattern.areaName} (${pattern.matchCount} matches)`,
        };
      }
    }

    return null;
  }

  /**
   * Layer 5: Group devices that likely belong together (50% confidence)
   */
  private checkDeviceGroup(device: DiscoveredDevice, allDevices: DiscoveredDevice[], haAreas: DiscoveredArea[]): AssignmentResult | null {
    // If device is part of a group, check if other group members have assignments
    if (device.isGroup && device.groupMembers) {
      const memberDevices = allDevices.filter(d => device.groupMembers?.includes(d.id));
      const assignedMembers = memberDevices.filter(d => d.area_id || d.area_name);
      
      if (assignedMembers.length > 0) {
        const mostCommonArea = assignedMembers[0];
        return {
          deviceId: device.id,
          areaId: mostCommonArea.area_id || null,
          areaName: mostCommonArea.area_name || null,
          confidence: 50,
          source: 'device_group',
          reasoning: `Group member devices are assigned to ${mostCommonArea.area_name}`,
        };
      }
    }

    return null;
  }

  /**
   * Main auto-assignment function - runs all layers
   */
  autoAssignDevice(device: DiscoveredDevice, haAreas: DiscoveredArea[], allDevices: DiscoveredDevice[]): AssignmentResult {
    // Layer 1: HA Registry (100%)
    const haResult = this.checkHAAreaId(device, haAreas);
    if (haResult) return haResult;

    // Layer 2: Entity ID (85%)
    const entityIdResult = this.parseEntityId(device, haAreas);
    if (entityIdResult) return entityIdResult;

    // Layer 3: Friendly Name (70%)
    const friendlyNameResult = this.parseFriendlyName(device, haAreas);
    if (friendlyNameResult) return friendlyNameResult;

    // Layer 4: Learned Patterns (60%)
    const learnedResult = this.checkLearnedPatterns(device, haAreas);
    if (learnedResult) return learnedResult;

    // Layer 5: Device Group (50%)
    const groupResult = this.checkDeviceGroup(device, allDevices, haAreas);
    if (groupResult) return groupResult;

    // No match found
    return {
      deviceId: device.id,
      areaId: null,
      areaName: null,
      confidence: 0,
      source: 'unknown',
      reasoning: 'No automatic assignment could be determined',
    };
  }

  /**
   * Batch auto-assign all devices
   */
  autoAssignAll(devices: DiscoveredDevice[], haAreas: DiscoveredArea[]): AssignmentResult[] {
    return devices.map(device => this.autoAssignDevice(device, haAreas, devices));
  }

  /**
   * Learn from user's manual assignment
   */
  learnFromAssignment(device: DiscoveredDevice, areaId: string, areaName: string): void {
    // Learn manufacturer pattern
    if (device.manufacturer) {
      const key = `manufacturer:${device.manufacturer.toLowerCase()}`;
      const existing = this.learnedPatterns.get(key);
      
      if (existing && existing.areaId === areaId) {
        existing.matchCount++;
      } else {
        this.learnedPatterns.set(key, {
          pattern: device.manufacturer,
          areaId,
          areaName,
          matchCount: 1,
        });
      }
    }

    // Learn model pattern
    if (device.model) {
      const key = `model:${device.model.toLowerCase()}`;
      const existing = this.learnedPatterns.get(key);
      
      if (existing && existing.areaId === areaId) {
        existing.matchCount++;
      } else {
        this.learnedPatterns.set(key, {
          pattern: device.model,
          areaId,
          areaName,
          matchCount: 1,
        });
      }
    }

    // Learn name pattern (first word)
    const firstWord = device.name.split(' ')[0].toLowerCase();
    if (firstWord.length > 2) {
      const key = `name:${firstWord}`;
      const existing = this.learnedPatterns.get(key);
      
      if (existing && existing.areaId === areaId) {
        existing.matchCount++;
      } else {
        this.learnedPatterns.set(key, {
          pattern: firstWord,
          areaId,
          areaName,
          matchCount: 1,
        });
      }
    }
  }

  /**
   * Get all learned patterns for persistence
   */
  getLearnedPatterns(): LearnedPattern[] {
    return Array.from(this.learnedPatterns.values());
  }
}
