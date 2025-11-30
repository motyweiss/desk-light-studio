import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EntityItem } from "./EntityItem";
import { cn } from "@/lib/utils";

interface EntitySearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  entities: Array<{
    entity_id: string;
    state: string;
    attributes: {
      friendly_name?: string;
      brightness?: number;
      device_class?: string;
      unit_of_measurement?: string;
    };
    area_name?: string;
    device_name?: string;
  }>;
  entityType: 'light' | 'sensor' | 'media_player';
  sensorType?: 'temperature' | 'humidity' | 'air_quality' | 'battery';
  placeholder?: string;
  isLoading?: boolean;
}

export const EntitySearchSelect = ({
  value,
  onValueChange,
  entities,
  entityType,
  sensorType,
  placeholder = "Search entities...",
  isLoading = false,
}: EntitySearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filter entities by type
  const filteredEntities = useMemo(() => {
    let filtered = entities.filter(e => e.entity_id.startsWith(`${entityType}.`));
    
    // Additional filtering for sensors
    if (entityType === 'sensor' && sensorType) {
      filtered = filtered.filter(e => {
        const { entity_id, attributes } = e;
        const deviceClass = attributes.device_class;
        
        if (sensorType === 'temperature') {
          return deviceClass === 'temperature' || entity_id.includes('temperature');
        }
        if (sensorType === 'humidity') {
          return deviceClass === 'humidity' || entity_id.includes('humidity');
        }
        if (sensorType === 'air_quality') {
          return deviceClass === 'pm25' || entity_id.includes('pm') || entity_id.includes('air');
        }
        if (sensorType === 'battery') {
          return deviceClass === 'battery' || entity_id.includes('battery');
        }
        
        return true;
      });
    }
    
    return filtered;
  }, [entities, entityType, sensorType]);

  // Group entities by area
  const groupedEntities = useMemo(() => {
    const groups: Record<string, typeof filteredEntities> = {};
    
    filteredEntities.forEach(entity => {
      const areaName = entity.area_name || 'No Room';
      if (!groups[areaName]) {
        groups[areaName] = [];
      }
      groups[areaName].push(entity);
    });
    
    // Sort groups: rooms with entities first, then "No Room"
    const sortedGroups: Record<string, typeof filteredEntities> = {};
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'No Room') return 1;
      if (b === 'No Room') return -1;
      return a.localeCompare(b);
    });
    
    sortedKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });
    
    return sortedGroups;
  }, [filteredEntities]);

  // Find selected entity
  const selectedEntity = filteredEntities.find(e => e.entity_id === value);
  const displayValue = selectedEntity?.attributes.friendly_name || value || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-11 rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-sm px-4 text-sm text-white hover:bg-white/[0.08] transition-all duration-200",
            !value && "text-white/40"
          )}
        >
          <span className="truncate">
            {isLoading ? "Loading..." : displayValue}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={placeholder} 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No entities found.</CommandEmpty>
            {Object.entries(groupedEntities).map(([areaName, areaEntities]) => (
              <CommandGroup key={areaName} heading={areaName}>
                {areaEntities.map((entity) => (
                  <CommandItem
                    key={entity.entity_id}
                    value={`${entity.entity_id} ${entity.attributes.friendly_name || ''} ${entity.area_name || ''} ${entity.device_name || ''}`}
                    onSelect={() => {
                      onValueChange(entity.entity_id);
                      setOpen(false);
                    }}
                  >
                    <EntityItem
                      entity={entity}
                      isSelected={value === entity.entity_id}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
