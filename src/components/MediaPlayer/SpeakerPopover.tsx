import { motion, AnimatePresence } from 'framer-motion';
import { Check, Speaker, Smartphone, Monitor, Volume2 } from 'lucide-react';
import type { MediaPlayerEntity } from '@/services/homeAssistant';

interface SpeakerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  currentSource: string;
  spotifySources: string[];
  availableSpeakers: MediaPlayerEntity[];
  onSourceChange: (source: string) => void;
  anchorRef: React.RefObject<HTMLElement>;
}

const getIconForSpeaker = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('iphone') || lowerName.includes('phone')) return Smartphone;
  if (lowerName.includes('mac') || lowerName.includes('macbook')) return Monitor;
  if (lowerName.includes('sonos') || lowerName.includes('arc') || lowerName.includes('sofa')) return Volume2;
  return Speaker;
};

export const SpeakerPopover = ({
  isOpen,
  onClose,
  currentSource,
  spotifySources,
  availableSpeakers,
  onSourceChange,
  anchorRef,
}: SpeakerPopoverProps) => {
  const hasSpotifySources = spotifySources.length > 0;
  const hasSpeakers = availableSpeakers.length > 0;

  const handleSourceSelect = (source: string) => {
    onSourceChange(source);
    onClose();
  };

  // Calculate position relative to anchor
  const getPopoverStyle = (): React.CSSProperties => {
    if (!anchorRef.current) return {};
    
    const rect = anchorRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      bottom: `${window.innerHeight - rect.top + 8}px`,
      right: `${window.innerWidth - rect.right}px`,
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            onClick={onClose}
          />

          {/* Popover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.25, 0.1, 0.25, 1]
            }}
            style={getPopoverStyle()}
            className="z-[101] w-[280px] max-h-[320px] bg-[#2a2520]/95 backdrop-blur-[40px] border border-white/20 rounded-xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto max-h-[320px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="p-3 space-y-3">
                {/* Spotify Connect Sources */}
                {hasSpotifySources && (
                  <div className="space-y-2">
                    <h4 className="text-white/40 text-[10px] font-light uppercase tracking-wider px-1">
                      Spotify Connect
                    </h4>
                    <div className="space-y-1">
                      {spotifySources.map((source) => {
                        const isActive = currentSource === source;
                        const Icon = getIconForSpeaker(source);
                        
                        return (
                          <motion.button
                            key={source}
                            onClick={() => handleSourceSelect(source)}
                            className={`
                              w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                              transition-all duration-200
                              ${isActive 
                                ? 'bg-[hsl(44_85%_58%)]/15 border-[hsl(44_85%_58%)]/30' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                              }
                              border backdrop-blur-sm
                            `}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className={`
                              w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                              ${isActive ? 'bg-[hsl(44_85%_58%)]/20' : 'bg-white/5'}
                            `}>
                              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[hsl(44_85%_58%)]' : 'text-white/50'}`} />
                            </div>
                            
                            <span className={`
                              flex-1 text-left text-xs font-light truncate
                              ${isActive ? 'text-white' : 'text-white/70'}
                            `}>
                              {source}
                            </span>

                            {isActive && (
                              <Check className="w-3.5 h-3.5 text-[hsl(44_85%_58%)] flex-shrink-0" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Speakers */}
                {hasSpeakers && (
                  <div className="space-y-2">
                    <h4 className="text-white/40 text-[10px] font-light uppercase tracking-wider px-1">
                      Home Speakers
                    </h4>
                    <div className="space-y-1">
                      {availableSpeakers
                        .filter(s => !spotifySources.includes(s.attributes.friendly_name || ''))
                        .map((speaker) => {
                          const name = speaker.attributes.friendly_name || speaker.entity_id;
                          const isActive = currentSource === name;
                          const Icon = getIconForSpeaker(name);
                          const isDefaultGroup = name.toLowerCase().includes('arc') && name.toLowerCase().includes('sofa');
                          
                          return (
                            <motion.button
                              key={speaker.entity_id}
                              onClick={() => handleSourceSelect(name)}
                              className={`
                                w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                                transition-all duration-200
                                ${isActive 
                                  ? 'bg-[hsl(44_85%_58%)]/15 border-[hsl(44_85%_58%)]/30' 
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }
                                border backdrop-blur-sm
                              `}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={`
                                w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                                ${isActive ? 'bg-[hsl(44_85%_58%)]/20' : 'bg-white/5'}
                              `}>
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[hsl(44_85%_58%)]' : 'text-white/50'}`} />
                              </div>
                              
                              <span className={`
                                flex-1 text-left text-xs font-light truncate
                                ${isActive ? 'text-white' : 'text-white/70'}
                              `}>
                                {name}
                              </span>

                              {isDefaultGroup && (
                                <span className="text-[hsl(44_85%_58%)] text-xs">⭐</span>
                              )}

                              {isActive && (
                                <Check className="w-3.5 h-3.5 text-[hsl(44_85%_58%)] flex-shrink-0" />
                              )}
                            </motion.button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {!hasSpotifySources && !hasSpeakers && (
                  <div className="text-center py-8 text-white/40">
                    <p className="text-xs">No speakers available</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
