import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SpeakerItem } from './SpeakerItem';
import type { MediaPlayerEntity } from '@/services/homeAssistant';

interface SpeakerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSource: string;
  spotifySources: string[];
  availableSpeakers: MediaPlayerEntity[];
  onSourceChange: (source: string) => void;
}

export const SpeakerSheet = ({
  isOpen,
  onClose,
  currentSource,
  spotifySources,
  availableSpeakers,
  onSourceChange,
}: SpeakerSheetProps) => {
  const hasSpotifySources = spotifySources.length > 0;
  const hasSpeakers = availableSpeakers.length > 0;

  const handleSourceSelect = (source: string) => {
    onSourceChange(source);
    onClose();
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              duration: 0.5, 
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="fixed bottom-0 left-0 right-0 z-[101] max-h-[80vh] pb-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#2a2520]/95 backdrop-blur-[40px] border-t border-white/20 rounded-t-3xl overflow-hidden">
              {/* Header */}
              <div className="sticky top-0 bg-[#2a2520]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white text-lg font-light">Select Speaker</h3>
                  <p className="text-white/40 text-xs mt-0.5">Choose where to play your music</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 max-h-[calc(80vh-120px)] overflow-y-auto">
                <div className="space-y-6">
                  {/* Spotify Connect Sources */}
                  {hasSpotifySources && (
                    <div className="space-y-3">
                      <h4 className="text-white/50 text-xs font-light uppercase tracking-wider px-1">
                        Spotify Connect
                      </h4>
                      <div className="space-y-2">
                        {spotifySources.map((source) => (
                          <SpeakerItem
                            key={source}
                            name={source}
                            isActive={currentSource === source}
                            onClick={() => handleSourceSelect(source)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Speakers */}
                  {hasSpeakers && (
                    <div className="space-y-3">
                      <h4 className="text-white/50 text-xs font-light uppercase tracking-wider px-1">
                        Available Speakers
                      </h4>
                      <div className="space-y-2">
                        {availableSpeakers
                          .filter(s => !spotifySources.includes(s.attributes.friendly_name || ''))
                          .map((speaker) => {
                            const name = speaker.attributes.friendly_name || speaker.entity_id;
                            return (
                              <SpeakerItem
                                key={speaker.entity_id}
                                name={name}
                                isActive={currentSource === name}
                                onClick={() => handleSourceSelect(name)}
                              />
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {!hasSpotifySources && !hasSpeakers && (
                    <div className="text-center py-12 text-white/40">
                      <p className="text-sm">No speakers available</p>
                      <p className="text-xs mt-1">Check your Home Assistant connection</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};