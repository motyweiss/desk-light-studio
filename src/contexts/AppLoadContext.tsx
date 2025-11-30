import { createContext, useContext, useState, ReactNode } from 'react';

interface AppLoadContextValue {
  hasInitiallyLoaded: boolean;
  setInitiallyLoaded: () => void;
}

const AppLoadContext = createContext<AppLoadContextValue | undefined>(undefined);

export const AppLoadProvider = ({ children }: { children: ReactNode }) => {
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const setInitiallyLoaded = () => {
    setHasInitiallyLoaded(true);
  };

  return (
    <AppLoadContext.Provider value={{ hasInitiallyLoaded, setInitiallyLoaded }}>
      {children}
    </AppLoadContext.Provider>
  );
};

export const useAppLoad = () => {
  const context = useContext(AppLoadContext);
  if (context === undefined) {
    throw new Error('useAppLoad must be used within an AppLoadProvider');
  }
  return context;
};
