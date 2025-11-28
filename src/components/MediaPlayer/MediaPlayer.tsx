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
  const { playerState: realPlayerState, isLoading: realIsLoading } = useMediaPlayerSync({
    entityId,
    enabled: isConnected && !!entityId,
  });

  // Mock demo data for display when not connected
  const demoPlayerState = {
    isPlaying: true,
    isPaused: false,
    isIdle: false,
    isOff: false,
    volume: 0.65,
    isMuted: false,
    currentTrack: {
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      album: 'A Night at the Opera',
      albumArt: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_At_The_Opera.png',
      duration: 354,
      position: 127,
    },
    shuffle: false,
    repeat: 'off' as const,
    source: 'Living Room',
    availableSources: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom'],
    groupedSpeakers: [],
    appName: 'Spotify',
    isPending: false,
    isLoading: false,
    entityId: entityId || 'media_player.demo',
  };

  // Use real state if connected and available, otherwise use demo state
  const playerState = (isConnected && realPlayerState) ? realPlayerState : demoPlayerState;
  
  // Only show loading if we're actually waiting for real data
  const isLoading = isConnected && !!entityId && realIsLoading && !realPlayerState;

  const handlePlayPause = async () => {
    if (!isConnected || !entityId) return;
    await homeAssistant.mediaPlayPause(entityId);
  };

  const handlePrevious = async () => {
    if (!isConnected || !entityId) return;
    await homeAssistant.mediaPreviousTrack(entityId);
  };

  const handleNext = async () => {
    if (!isConnected || !entityId) return;
    await homeAssistant.mediaNextTrack(entityId);
  };

  const handleVolumeChange = async (volume: number) => {
    if (!isConnected || !entityId) return;
    await homeAssistant.setMediaVolume(entityId, volume);
  };

  const handleMuteToggle = async () => {
    if (!isConnected || !entityId) return;
    await homeAssistant.toggleMediaMute(entityId);
  };

  const handleShuffleToggle = async () => {
    if (!isConnected || !entityId) return;
    await homeAssistant.setMediaShuffle(entityId, !playerState.shuffle);
  };

  const handleRepeatToggle = async () => {
    if (!isConnected || !entityId) return;
    const nextRepeat = playerState.repeat === 'off' ? 'all' : playerState.repeat === 'all' ? 'one' : 'off';
    await homeAssistant.setMediaRepeat(entityId, nextRepeat);
  };

  const handleSourceChange = async (source: string) => {
    if (!isConnected || !entityId) return;
    await homeAssistant.setMediaSource(entityId, source);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.03, 0.26, 1] }}
        className="fixed bottom-0 left-0 right-0 z-50 w-full"
      >
        <div className="bg-white/8 backdrop-blur-[24px] border-t border-white/20 rounded-t-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] p-6 max-w-none">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-white/40" />
            </div>
          ) : (
            <div className="space-y-4 max-w-7xl mx-auto">
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
