import { Speaker } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
import type { MediaPlayerEntity } from '@/services/homeAssistant';

interface SpeakerSelectorProps {
  currentSource: string;
  spotifySources: string[];
  availableSpeakers: MediaPlayerEntity[];
  onSourceChange: (source: string) => void;
}

export const SpeakerSelector = ({ 
  currentSource, 
  spotifySources, 
  availableSpeakers,
  onSourceChange 
}: SpeakerSelectorProps) => {
  const hasSpotifySources = spotifySources.length > 0;
  const hasSpeakers = availableSpeakers.length > 0;
  
  if (!hasSpotifySources && !hasSpeakers) return null;

  // Get all unique sources
  const speakerNames = availableSpeakers.map(s => s.attributes.friendly_name || s.entity_id);
  const allSources = [...new Set([...spotifySources, ...speakerNames])];

  return (
    <div className="flex items-center gap-2">
      <Speaker className="w-4 h-4 text-white/40" />
      <Select value={currentSource} onValueChange={onSourceChange}>
        <SelectTrigger className="h-8 w-[200px] text-sm">
          <SelectValue placeholder="Select speaker..." />
        </SelectTrigger>
        <SelectContent>
          {hasSpotifySources && (
            <SelectGroup>
              <SelectLabel>Spotify Connect</SelectLabel>
              {spotifySources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          
          {hasSpotifySources && hasSpeakers && <SelectSeparator />}
          
          {hasSpeakers && (
            <SelectGroup>
              <SelectLabel>Available Speakers</SelectLabel>
              {availableSpeakers
                .filter(s => !spotifySources.includes(s.attributes.friendly_name || ''))
                .map((speaker) => {
                  const name = speaker.attributes.friendly_name || speaker.entity_id;
                  return (
                    <SelectItem key={speaker.entity_id} value={name}>
                      {name}
                    </SelectItem>
                  );
                })}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
