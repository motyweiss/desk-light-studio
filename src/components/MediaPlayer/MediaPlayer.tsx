import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { homeAssistant } from '@/services/homeAssistant';
import { AlbumArt } from './AlbumArt';
import { ProgressBar } from './ProgressBar';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControl } from './VolumeControl';
import { SpeakerSelector } from './SpeakerSelector';
import { SourceIndicator } from './SourceIndicator';

interface MediaPlayerProps {
  entityId: string | undefined;
  isConnected: boolean;
}

export const MediaPlayer = ({ entityId, isConnected }: MediaPlayerProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  
  // For demo purposes, we'll always show the player with demo data
  // Real Home Assistant integration can be added later
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
    entityId: 'media_player.demo',
  };

  const playerState = demoPlayerState;

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
    <motion.div
      initial={{ y: 150, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.22, 0.03, 0.26, 1],
        delay: 0.3
      }}
      className="fixed bottom-0 left-0 right-0 z-50 w-full"
    >
      <motion.div 
        className="bg-white/8 backdrop-blur-[24px] border-t border-white/20 rounded-t-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] overflow-hidden max-w-none relative"
        animate={{ 
          height: isMinimized ? '80px' : 'auto',
          paddingTop: isMinimized ? '12px' : '24px',
          paddingBottom: isMinimized ? '12px' : '24px',
        }}
        transition={{ duration: 0.5, ease: [0.22, 0.03, 0.26, 1] }}
      >
        {/* Minimize/Maximize Button */}
        <motion.button
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute top-2 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMinimized ? (
            <ChevronUp className="w-4 h-4 text-white/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/60" />
          )}
        </motion.button>

        {isMinimized ? (
          /* Mini Player */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 px-6 max-w-7xl mx-auto"
          >
            {/* Album Art - smaller */}
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
              {playerState.currentTrack?.albumArt ? (
                <img 
                  src={playerState.currentTrack.albumArt} 
                  alt="Album art" 
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-light text-base truncate">
                {playerState.currentTrack?.title || 'No media playing'}
              </h3>
              <p className="text-white/40 text-xs truncate">
                {playerState.currentTrack?.artist || 'Unknown Artist'}
              </p>
            </div>

            {/* Mini Controls */}
            <div className="flex items-center gap-4">
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

              <div className="flex items-center gap-3">
                <VolumeControl
                  volume={playerState.volume}
                  isMuted={playerState.isMuted}
                  onVolumeChange={handleVolumeChange}
                  onMuteToggle={handleMuteToggle}
                />

                <SourceIndicator appName={playerState.appName} />
              </div>
            </div>
          </motion.div>
        ) : (
          /* Full Player */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 px-6 max-w-7xl mx-auto"
          >
            {/* Top Row: Album Art + Track Info + Source */}
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
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
