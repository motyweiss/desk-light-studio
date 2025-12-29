import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MediaPlayerUIState {
  isMinimized: boolean;
  isVisible: boolean;
  playerHeight: number;
}

interface MediaPlayerUIContextValue extends MediaPlayerUIState {
  setIsMinimized: (value: boolean) => void;
  setIsVisible: (value: boolean) => void;
  setPlayerHeight: (value: number) => void;
  toggleMinimized: () => void;
}

const MediaPlayerUIContext = createContext<MediaPlayerUIContextValue | null>(null);

// Player heights in pixels
export const PLAYER_HEIGHTS = {
  minimized: 72,
  expanded: 220,
  spacing: 16, // bottom spacing from screen edge
} as const;

interface MediaPlayerUIProviderProps {
  children: ReactNode;
}

export const MediaPlayerUIProvider = ({ children }: MediaPlayerUIProviderProps) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [playerHeight, setPlayerHeight] = useState<number>(PLAYER_HEIGHTS.minimized);

  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const value: MediaPlayerUIContextValue = {
    isMinimized,
    isVisible,
    playerHeight,
    setIsMinimized,
    setIsVisible,
    setPlayerHeight,
    toggleMinimized,
  };

  return (
    <MediaPlayerUIContext.Provider value={value}>
      {children}
    </MediaPlayerUIContext.Provider>
  );
};

export const useMediaPlayerUI = (): MediaPlayerUIContextValue => {
  const context = useContext(MediaPlayerUIContext);
  if (!context) {
    throw new Error('useMediaPlayerUI must be used within a MediaPlayerUIProvider');
  }
  return context;
};

// Safe hook that returns defaults when outside provider
export const useMediaPlayerUISafe = (): MediaPlayerUIState => {
  const context = useContext(MediaPlayerUIContext);
  return context ?? {
    isMinimized: true,
    isVisible: false,
    playerHeight: PLAYER_HEIGHTS.minimized,
  };
};
