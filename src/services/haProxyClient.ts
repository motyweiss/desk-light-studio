import { supabase } from "@/integrations/supabase/client";

interface ProxyRequest {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
}

interface ProxyResponse<T> {
  data: T | null;
  error: string | null;
}

interface DirectConfig {
  baseUrl: string;
  accessToken: string;
}

/**
 * Client for proxying Home Assistant API calls through the edge function.
 * Falls back to direct HTTP calls when Supabase session is not available.
 */
class HAProxyClient {
  private directConfig: DirectConfig | null = null;

  // Set direct config for fallback when no Supabase session
  setDirectConfig(config: DirectConfig | null) {
    this.directConfig = config ? {
      ...config,
      baseUrl: config.baseUrl.replace(/\/+$/, '')
    } : null;
  }

  getDirectConfig(): DirectConfig | null {
    return this.directConfig;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    } catch {
      return null;
    }
  }

  // Direct HTTP call to Home Assistant (bypasses proxy)
  private async directRequest<T = unknown>(params: ProxyRequest): Promise<ProxyResponse<T>> {
    if (!this.directConfig) {
      return { data: null, error: 'No direct config available' };
    }

    const url = `${this.directConfig.baseUrl}${params.path}`;
    
    try {
      const response = await fetch(url, {
        method: params.method || 'GET',
        headers: {
          'Authorization': `Bearer ${this.directConfig.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: params.data ? JSON.stringify(params.data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { data: data as T, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Direct request failed';
      return { data: null, error: message };
    }
  }

  async request<T = unknown>(params: ProxyRequest): Promise<ProxyResponse<T>> {
    const token = await this.getAuthToken();
    
    // If no Supabase session, try direct connection
    if (!token) {
      console.log('[HA Proxy] No Supabase session, using direct connection');
      return this.directRequest<T>(params);
    }

    try {
      const { data, error } = await supabase.functions.invoke('ha-proxy', {
        body: params,
      });

      if (error) {
        console.error('[HA Proxy Client] Proxy error, falling back to direct:', error);
        // Fallback to direct connection
        return this.directRequest<T>(params);
      }

      // Check if the response itself indicates an error
      if (data?.error) {
        // If it's an auth error, try direct connection
        if (data.error.includes('Not authenticated') || data.error.includes('auth')) {
          console.log('[HA Proxy] Auth error from proxy, trying direct connection');
          return this.directRequest<T>(params);
        }
        return { data: null, error: data.error };
      }

      return { data: data as T, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[HA Proxy Client] Exception, trying direct:', message);
      // Fallback to direct connection
      return this.directRequest<T>(params);
    }
  }

  // Convenience methods for common operations
  async get<T = unknown>(path: string): Promise<ProxyResponse<T>> {
    return this.request<T>({ path, method: 'GET' });
  }

  async post<T = unknown>(path: string, data?: unknown): Promise<ProxyResponse<T>> {
    return this.request<T>({ path, method: 'POST', data });
  }

  // Test connection - tries proxy first, then direct
  async testConnection(): Promise<{ success: boolean; version?: string; error?: string }> {
    const { data, error } = await this.get<{ version: string }>('/api/');
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, version: data?.version };
  }

  // Direct test connection (bypasses proxy entirely)
  async testDirectConnection(config: DirectConfig): Promise<{ success: boolean; version?: string; error?: string }> {
    const url = `${config.baseUrl.replace(/\/+$/, '')}/api/`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { success: true, version: data?.version };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      return { success: false, error: message };
    }
  }

  // Check if user has HA configured
  async isConfigured(): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('user_ha_configs')
        .select('id')
        .single();
      
      return !!data;
    } catch {
      return false;
    }
  }
}

export const haProxyClient = new HAProxyClient();
