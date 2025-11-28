import { useState, useEffect, useRef, useCallback } from 'react';
import { homeAssistant } from '@/services/homeAssistant';
import { useToast } from '@/hooks/use-toast';

interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  retryCount: number;
  lastConnectedAt: number;
}

export const useConnectionState = (isConfigured: boolean) => {
  const { toast } = useToast();
  const [state, setState] = useState<ConnectionState>({
    isConnected: false,
    isReconnecting: false,
    retryCount: 0,
    lastConnectedAt: 0,
  });

  const reconnectTimerRef = useRef<NodeJS.Timeout>();
  const maxRetries = 5;

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!isConfigured) return false;

    try {
      const result = await homeAssistant.testConnection();
      return result.success;
    } catch (error) {
      return false;
    }
  }, [isConfigured]);

  const attemptReconnect = useCallback(async () => {
    if (!isConfigured) return;

    setState(prev => ({ ...prev, isReconnecting: true }));

    const connected = await testConnection();

    if (connected) {
      setState({
        isConnected: true,
        isReconnecting: false,
        retryCount: 0,
        lastConnectedAt: Date.now(),
      });
      toast({
        title: "Reconnected",
        description: "Connection to Home Assistant restored.",
      });
    } else {
      setState(prev => {
        const newRetryCount = prev.retryCount + 1;
        
        if (newRetryCount >= maxRetries) {
          return {
            ...prev,
            isReconnecting: false,
            retryCount: newRetryCount,
          };
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        const delay = Math.min(Math.pow(2, newRetryCount) * 1000, 16000);
        
        reconnectTimerRef.current = setTimeout(() => {
          attemptReconnect();
        }, delay);

        return {
          ...prev,
          isReconnecting: true,
          retryCount: newRetryCount,
        };
      });
    }
  }, [isConfigured, testConnection, toast]);

  const handleConnectionLost = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
    }));

    toast({
      title: "Connection Lost",
      description: "Attempting to reconnect...",
      variant: "destructive",
    });

    attemptReconnect();
  }, [toast, attemptReconnect]);

  // Initial connection test
  useEffect(() => {
    if (!isConfigured) {
      setState({
        isConnected: false,
        isReconnecting: false,
        retryCount: 0,
        lastConnectedAt: 0,
      });
      return;
    }

    testConnection().then(connected => {
      setState({
        isConnected: connected,
        isReconnecting: false,
        retryCount: 0,
        lastConnectedAt: connected ? Date.now() : 0,
      });
    });
  }, [isConfigured, testConnection]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, []);

  return {
    isConnected: state.isConnected,
    isReconnecting: state.isReconnecting,
    retryCount: state.retryCount,
    handleConnectionLost,
    attemptReconnect,
  };
};
