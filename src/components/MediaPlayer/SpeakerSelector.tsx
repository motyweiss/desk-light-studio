import { Speaker } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpeakerSelectorProps {
  currentSource: string;
  availableSources: string[];
  onSourceChange: (source: string) => void;
}

export const SpeakerSelector = ({ currentSource, availableSources, onSourceChange }: SpeakerSelectorProps) => {
  if (availableSources.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Speaker className="w-4 h-4 text-white/40" />
      <Select value={currentSource} onValueChange={onSourceChange}>
        <SelectTrigger className="h-8 w-[180px] text-sm">
          <SelectValue placeholder="Select speaker..." />
        </SelectTrigger>
        <SelectContent>
          {availableSources.map((source) => (
            <SelectItem key={source} value={source}>
              {source}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
