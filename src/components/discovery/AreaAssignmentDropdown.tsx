import { useState } from 'react';
import { Check, MapPin, Plus, Search } from 'lucide-react';
import { useAreaManagement } from '@/contexts/AreaManagementContext';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AreaAssignmentDropdownProps {
  deviceId: string;
  deviceName: string;
}

const AreaAssignmentDropdown = ({ deviceId, deviceName }: AreaAssignmentDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { areas, getDeviceArea, assignDevice, createArea } = useAreaManagement();
  const currentAreaId = getDeviceArea(deviceId);

  const handleSelect = (areaId: string | null) => {
    assignDevice(deviceId, areaId);
    setOpen(false);
  };

  const handleCreateNew = () => {
    if (searchValue.trim()) {
      const newArea = createArea(searchValue.trim());
      assignDevice(deviceId, newArea.id);
      setSearchValue('');
      setOpen(false);
    }
  };

  const currentArea = areas.find(a => a.id === currentAreaId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between min-w-[180px] bg-white/[0.03] backdrop-blur-sm border-white/10 hover:bg-white/[0.06] hover:border-white/20 text-white/90"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-white/50" strokeWidth={1.5} />
            <span className="text-sm font-light">
              {currentArea ? currentArea.name : 'Unassigned'}
            </span>
          </div>
          <svg
            className="ml-2 h-4 w-4 shrink-0 opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-0 bg-[hsl(28,20%,18%)]/95 backdrop-blur-xl border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="bg-transparent">
          <div className="flex items-center border-b border-white/10 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-white/40" strokeWidth={1.5} />
            <input
              placeholder="Search or create area..."
              className="flex h-11 w-full bg-transparent py-3 text-sm text-white/90 placeholder:text-white/40 outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchValue.trim() && !areas.some(a => a.name.toLowerCase() === searchValue.toLowerCase())) {
                  handleCreateNew();
                }
              }}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm text-white/60">
              <div className="flex flex-col items-center gap-2">
                <span>No area found.</span>
                {searchValue.trim() && (
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white/90 text-xs transition-colors"
                  >
                    <Plus className="w-3 h-3" strokeWidth={1.5} />
                    Create "{searchValue}"
                  </button>
                )}
              </div>
            </CommandEmpty>
            
            <CommandGroup>
              <CommandItem
                value="unassigned"
                onSelect={() => handleSelect(null)}
                className="flex items-center justify-between cursor-pointer text-white/70 hover:text-white/90 hover:bg-white/[0.06] data-[selected]:bg-white/[0.06] data-[selected]:text-white/90"
              >
                <span className="font-light">Unassigned</span>
                {!currentAreaId && (
                  <Check className="w-4 h-4 text-[hsl(44,85%,58%)]" strokeWidth={2} />
                )}
              </CommandItem>
            </CommandGroup>

            {areas.length > 0 && (
              <>
                <CommandSeparator className="bg-white/10" />
                <CommandGroup heading={<span className="text-white/40 text-xs font-light px-2 py-1.5">Areas</span>}>
                  {areas.map((area) => (
                    <CommandItem
                      key={area.id}
                      value={area.name}
                      onSelect={() => handleSelect(area.id)}
                      className="flex items-center justify-between cursor-pointer text-white/70 hover:text-white/90 hover:bg-white/[0.06] data-[selected]:bg-white/[0.06] data-[selected]:text-white/90"
                    >
                      <span className="font-light">{area.name}</span>
                      {currentAreaId === area.id && (
                        <Check className="w-4 h-4 text-[hsl(44,85%,58%)]" strokeWidth={2} />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {searchValue.trim() && !areas.some(a => a.name.toLowerCase() === searchValue.toLowerCase()) && (
              <>
                <CommandSeparator className="bg-white/10" />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreateNew}
                    className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white/90 hover:bg-white/[0.06] data-[selected]:bg-white/[0.06] data-[selected]:text-white/90"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    <span className="font-light">Create "{searchValue}"</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AreaAssignmentDropdown;
