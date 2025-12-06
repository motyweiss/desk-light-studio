import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { homeAssistant } from '@/services/homeAssistant';
import { haClient } from '@/api/homeAssistant/client';

interface HAConfig {
  baseUrl: string;
  accessToken: string;
}

interface UseHAConfigReturn {
  config: HAConfig | null;
  isLoading: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  haVersion: string | null;
  error: string | null;
  saveConfig: (baseUrl: string, accessToken: string) => Promise<{ success: boolean; error?: string }>;
  deleteConfig: () => Promise<void>;
  testConnection: (baseUrl: string, accessToken: string) => Promise<{ success: boolean; version?: string; error?: string }>;
}

/**
 * Hook for managing Home Assistant configuration stored securely in the database.
 * The access token is stored server-side and never exposed to localStorage.
 */
export function useHAConfig(): UseHAConfigReturn {
  const { user } = useAuth();
  const [config, setConfig] = useState<HAConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [haVersion, setHaVersion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load config from database
  const loadConfig = useCallback(async () => {
    if (!user) {
      setConfig(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('user_ha_configs')
        .select('base_url, access_token')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code !== 'PGRST116') { // Not found is ok
          console.error('[useHAConfig] Error loading config:', fetchError);
          setError(fetchError.message);
        }
        setConfig(null);
      } else if (data) {
        setConfig({
          baseUrl: data.base_url,
          accessToken: data.access_token,
        });
        
        // Configure BOTH homeAssistant services to ensure all components work
        const configObj = {
          baseUrl: data.base_url,
          accessToken: data.access_token,
        };
        homeAssistant.setConfig(configObj);
        haClient.setConfig(configObj);

        // Test connection
        setIsConnecting(true);
        try {
          const result = await homeAssistant.testConnection();
          if (result.success) {
            setIsConnected(true);
            setHaVersion(result.version || null);
          } else {
            setIsConnected(false);
            setHaVersion(null);
          }
        } catch {
          setIsConnected(false);
          setHaVersion(null);
        } finally {
          setIsConnecting(false);
        }
      }
    } catch (err) {
      console.error('[useHAConfig] Exception:', err);
      setError(err instanceof Error ? err.message : 'Failed to load config');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Save config to database
  const saveConfig = useCallback(async (baseUrl: string, accessToken: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Upsert the config
      const { error: upsertError } = await supabase
        .from('user_ha_configs')
        .upsert({
          user_id: user.id,
          base_url: baseUrl.replace(/\/+$/, ''), // Remove trailing slashes
          access_token: accessToken,
        }, {
          onConflict: 'user_id',
        });

      if (upsertError) {
        console.error('[useHAConfig] Error saving config:', upsertError);
        return { success: false, error: upsertError.message };
      }

      // Update local state
      setConfig({ baseUrl, accessToken });
      
      // Configure BOTH homeAssistant services
      const configObj = { baseUrl, accessToken };
      homeAssistant.setConfig(configObj);
      haClient.setConfig(configObj);

      // Test connection
      setIsConnecting(true);
      try {
        const result = await homeAssistant.testConnection();
        if (result.success) {
          setIsConnected(true);
          setHaVersion(result.version || null);
        } else {
          setIsConnected(false);
          setHaVersion(null);
        }
      } catch {
        setIsConnected(false);
        setHaVersion(null);
      } finally {
        setIsConnecting(false);
      }

      // Clear any legacy localStorage data
      localStorage.removeItem('ha_config');
      localStorage.removeItem('ha_token');

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save config';
      return { success: false, error: message };
    }
  }, [user]);

  // Delete config from database
  const deleteConfig = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_ha_configs')
        .delete()
        .eq('user_id', user.id);

      setConfig(null);
      setIsConnected(false);
      setHaVersion(null);
      
      // Clear legacy localStorage
      localStorage.removeItem('ha_config');
      localStorage.removeItem('ha_token');
      localStorage.removeItem('ha_recent_urls');
    } catch (err) {
      console.error('[useHAConfig] Error deleting config:', err);
    }
  }, [user]);

  // Test connection without saving
  const testConnection = useCallback(async (baseUrl: string, accessToken: string): Promise<{ success: boolean; version?: string; error?: string }> => {
    try {
      // Temporarily set config to test on both clients
      const configObj = { baseUrl, accessToken };
      homeAssistant.setConfig(configObj);
      haClient.setConfig(configObj);
      const result = await homeAssistant.testConnection();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      return { success: false, error: message };
    }
  }, []);

  return {
    config,
    isLoading,
    isConnected,
    isConnecting,
    haVersion,
    error,
    saveConfig,
    deleteConfig,
    testConnection,
  };
}
