import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Lightbulb, Thermometer, Droplets, Wind, Battery, Music, AlertCircle } from "lucide-react";
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

const getEntityIcon = (entityType: string, deviceClass?: string) => {
  if (entityType === 'light') return Lightbulb;
  if (entityType === 'media_player') return Music;
  if (entityType === 'sensor') {
    switch (deviceClass) {
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'pm25':
      case 'pm10':
      case 'aqi': return Wind;
      case 'battery': return Battery;
      default: return Thermometer;
    }
  }
  return AlertCircle;
};

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
      const areaName = entity.area_name || 'Unassigned';
      if (!groups[areaName]) {
        groups[areaName] = [];
      }
      groups[areaName].push(entity);
    });
    
    // Sort groups: rooms with entities first, then "Unassigned"
    const sortedGroups: Record<string, typeof filteredEntities> = {};
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
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
            "w-full justify-between h-10 rounded-xl border border-border/40 bg-secondary/40 backdrop-blur-sm px-3 text-sm text-foreground hover:bg-secondary/60 hover:border-border/60 transition-all duration-200",
            !value && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {value && selectedEntity && (
              <div className="w-4 h-4 rounded flex items-center justify-center">
                {(() => {
                  const Icon = getEntityIcon(entityType, selectedEntity.attributes.device_class);
                  return <Icon className="w-3.5 h-3.5 text-foreground/50" strokeWidth={1.5} />;
                })()}
              </div>
            )}
            <span className="truncate">
              {isLoading ? "Loading..." : displayValue}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-foreground/30" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[380px] p-0 bg-card border-border/50 shadow-2xl shadow-black/40" 
        align="start"
        sideOffset={8}
      >
        <Command className="bg-transparent">
          <CommandInput 
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
            className="border-0 border-b border-border/30 rounded-none focus:ring-0"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
              No entities found
            </CommandEmpty>
            {Object.entries(groupedEntities).map(([areaName, areaEntities]) => (
              <CommandGroup 
                key={areaName} 
                heading={areaName}
                className="px-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-muted-foreground/60 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:py-2"
              >
                {areaEntities.map((entity) => {
                  const Icon = getEntityIcon(entityType, entity.attributes.device_class);
                  const isSelected = value === entity.entity_id;
                  
                  return (
                    <CommandItem
                      key={entity.entity_id}
                      value={`${entity.entity_id} ${entity.attributes.friendly_name || ''} ${entity.area_name || ''} ${entity.device_name || ''}`}
                      onSelect={() => {
                        onValueChange(entity.entity_id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors",
                        isSelected && "bg-warm-glow/10"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-warm-glow/20" : "bg-secondary/50"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4",
                          isSelected ? "text-warm-glow" : "text-foreground/50"
                        )} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-sm truncate",
                          isSelected ? "text-foreground font-medium" : "text-foreground/80"
                        )}>
                          {entity.attributes.friendly_name || entity.entity_id}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                          <span className="font-mono truncate">{entity.entity_id}</span>
                          <span>•</span>
                          <span className={entity.state === 'on' ? 'text-status-optimal' : ''}>
                            {entity.state}
                            {entity.attributes.unit_of_measurement ? ` ${entity.attributes.unit_of_measurement}` : ''}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-warm-glow flex-shrink-0" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
