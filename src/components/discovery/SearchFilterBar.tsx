import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DeviceType } from '@/types/discovery';
import { MANUFACTURERS } from '@/config/entityFilters';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypes: DeviceType[];
  onTypesChange: (types: DeviceType[]) => void;
  selectedManufacturers: string[];
  onManufacturersChange: (manufacturers: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: 'light', label: 'Lights' },
  { value: 'climate', label: 'Climate' },
  { value: 'media_player', label: 'Media Players' },
  { value: 'sensor', label: 'Sensors' },
  { value: 'battery', label: 'Batteries' },
  { value: 'switch', label: 'Switches' },
  { value: 'cover', label: 'Covers' },
  { value: 'fan', label: 'Fans' },
  { value: 'vacuum', label: 'Vacuums' },
  { value: 'lock', label: 'Locks' },
  { value: 'camera', label: 'Cameras' },
];

const SearchFilterBar = ({
  searchQuery,
  onSearchChange,
  selectedTypes,
  onTypesChange,
  selectedManufacturers,
  onManufacturersChange,
  onClearFilters,
  hasActiveFilters
}: SearchFilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleType = (type: DeviceType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const toggleManufacturer = (manufacturer: string) => {
    if (selectedManufacturers.includes(manufacturer)) {
      onManufacturersChange(selectedManufacturers.filter(m => m !== manufacturer));
    } else {
      onManufacturersChange([...selectedManufacturers, manufacturer]);
    }
  };

  const activeFiltersCount = selectedTypes.length + selectedManufacturers.length;

  return (
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" strokeWidth={1.5} />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search devices..."
          className="pl-10 bg-white/[0.04] backdrop-blur-xl border-white/10 text-white/90 placeholder:text-white/40 focus:border-white/20"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/90 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Filter Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="relative bg-white/[0.04] backdrop-blur-xl border-white/10 hover:bg-white/[0.06] hover:border-white/20 text-white/90"
          >
            <Filter className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[hsl(44,85%,58%)] text-[hsl(28,20%,18%)] text-xs font-medium">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 bg-[hsl(28,20%,18%)]/95 backdrop-blur-xl border-white/10 p-4"
          align="end"
        >
          <div className="space-y-4">
            {/* Device Types */}
            <div>
              <h4 className="text-sm font-light text-white/90 mb-3">Device Types</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {DEVICE_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/[0.04] p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.value)}
                      onChange={() => toggleType(type.value)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-[hsl(44,85%,58%)] checked:border-[hsl(44,85%,58%)]"
                    />
                    <span className="text-sm font-light text-white/70">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Manufacturers */}
            <div>
              <h4 className="text-sm font-light text-white/90 mb-3">Manufacturers</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {MANUFACTURERS.map((mfr) => (
                  <label
                    key={mfr.name}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/[0.04] p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedManufacturers.includes(mfr.name)}
                      onChange={() => toggleManufacturer(mfr.name)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-[hsl(44,85%,58%)] checked:border-[hsl(44,85%,58%)]"
                    />
                    <span className="text-sm font-light text-white/70">{mfr.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                onClick={() => {
                  onClearFilters();
                  setIsOpen(false);
                }}
                variant="outline"
                className="w-full bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/90"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchFilterBar;
