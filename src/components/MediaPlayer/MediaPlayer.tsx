import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPlayerSync } from '@/hooks/useMediaPlayerSync';
import { homeAssistant } from '@/services/homeAssistant';
import { AlbumArt } from './AlbumArt';
import { ProgressBar } from './ProgressBar';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControl } from './VolumeControl';
import { SpeakerSelector } from './SpeakerSelector';
import { SourceIndicator } from './SourceIndicator';
import { Loader2 } from 'lucide-react';

interface MediaPlayerProps {
  entityId: string | undefined;
  isConnected: boolean;
}

export const MediaPlayer = ({ entityId, isConnected }: MediaPlayerProps) => {
  const { playerState, isLoading } = useMediaPlayerSync({
    entityId,
    enabled: isConnected && !!entityId,
  });

  console.log('MediaPlayer Debug:', { 
    isConnected, 
    entityId, 
    hasPlayerState: !!playerState,
    playerState: playerState ? {
      isPlaying: playerState.isPlaying,
      isOff: playerState.isOff,
      hasTrack: !!playerState.currentTrack
    } : null
  });

  // Don't show if not connected or no entity configured
  if (!isConnected || !entityId) return null;
  
  // Show loading state while fetching initial data
  if (!playerState && isLoading) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 0.03, 0.26, 1] }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
      >
        <div className="bg-white/8 backdrop-blur-[24px] border border-white/20 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-white/40" />
          </div>
        </div>
      </motion.div>
    );
  }

  // If no state yet, don't show
  if (!playerState) return null;

  const handlePlayPause = async () => {
    await homeAssistant.mediaPlayPause(entityId);
  };

  const handlePrevious = async () => {
    await homeAssistant.mediaPreviousTrack(entityId);
  };

  const handleNext = async () => {
    await homeAssistant.mediaNextTrack(entityId);
  };

  const handleVolumeChange = async (volume: number) => {
    await homeAssistant.setMediaVolume(entityId, volume);
  };

  const handleMuteToggle = async () => {
    await homeAssistant.toggleMediaMute(entityId);
  };

  const handleShuffleToggle = async () => {
    await homeAssistant.setMediaShuffle(entityId, !playerState.shuffle);
  };

  const handleRepeatToggle = async () => {
    const nextRepeat = playerState.repeat === 'off' ? 'all' : playerState.repeat === 'all' ? 'one' : 'off';
    await homeAssistant.setMediaRepeat(entityId, nextRepeat);
  };

  const handleSourceChange = async (source: string) => {
    await homeAssistant.setMediaSource(entityId, source);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.03, 0.26, 1] }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
      >
        <div className="bg-white/8 backdrop-blur-[24px] border border-white/20 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-white/40" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top Row: Album Art + Track Info + Shuffle/Repeat */}
              <div className="flex items-start gap-4">
                <AlbumArt 
                  albumArt={playerState.currentTrack?.albumArt || null} 
                  isPlaying={playerState.isPlaying}
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-light text-lg truncate">
                    {playerState.currentTrack?.title || 'No media playing'}
                  </h3>
                  <p className="text-white/40 text-sm truncate">
                    {playerState.currentTrack?.artist || 'Unknown Artist'}
                  </p>
                  {playerState.currentTrack?.album && (
                    <p className="text-white/30 text-xs truncate">
                      {playerState.currentTrack.album}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <SourceIndicator appName={playerState.appName} />
                </div>
              </div>

              {/* Progress Bar */}
              {playerState.currentTrack && (
                <ProgressBar
                  position={playerState.currentTrack.position}
                  duration={playerState.currentTrack.duration}
                />
              )}

              {/* Bottom Row: Playback Controls + Volume + Speaker Selector */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <PlaybackControls
                    isPlaying={playerState.isPlaying}
                    shuffle={playerState.shuffle}
                    repeat={playerState.repeat}
                    onPlayPause={handlePlayPause}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onShuffleToggle={handleShuffleToggle}
                    onRepeatToggle={handleRepeatToggle}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <VolumeControl
                    volume={playerState.volume}
                    isMuted={playerState.isMuted}
                    onVolumeChange={handleVolumeChange}
                    onMuteToggle={handleMuteToggle}
                  />

                  {playerState.availableSources.length > 0 && (
                    <SpeakerSelector
                      currentSource={playerState.source}
                      availableSources={playerState.availableSources}
                      onSourceChange={handleSourceChange}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
