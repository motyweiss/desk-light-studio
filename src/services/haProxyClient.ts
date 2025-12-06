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

/**
 * Client for proxying Home Assistant API calls through the edge function.
 * This keeps the HA access token secure on the server side.
 */
class HAProxyClient {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  async request<T = unknown>(params: ProxyRequest): Promise<ProxyResponse<T>> {
    const token = await this.getAuthToken();
    
    if (!token) {
      return { data: null, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('ha-proxy', {
        body: params,
      });

      if (error) {
        console.error('[HA Proxy Client] Error:', error);
        return { data: null, error: error.message };
      }

      // Check if the response itself indicates an error
      if (data?.error) {
        return { data: null, error: data.error };
      }

      return { data: data as T, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[HA Proxy Client] Exception:', message);
      return { data: null, error: message };
    }
  }

  // Convenience methods for common operations
  async get<T = unknown>(path: string): Promise<ProxyResponse<T>> {
    return this.request<T>({ path, method: 'GET' });
  }

  async post<T = unknown>(path: string, data?: unknown): Promise<ProxyResponse<T>> {
    return this.request<T>({ path, method: 'POST', data });
  }

  // Test connection by checking HA API endpoint
  async testConnection(): Promise<{ success: boolean; version?: string; error?: string }> {
    const { data, error } = await this.get<{ version: string }>('/api/');
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, version: data?.version };
  }

  // Check if user has HA configured
  async isConfigured(): Promise<boolean> {
    const { data } = await supabase
      .from('user_ha_configs')
      .select('id')
      .single();
    
    return !!data;
  }
}

export const haProxyClient = new HAProxyClient();
