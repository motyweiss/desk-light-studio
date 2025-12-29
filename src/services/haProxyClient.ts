// Lazy import to avoid circular dependency issues
let _supabase: typeof import("@/integrations/supabase/client").supabase | null = null;
const getSupabase = async () => {
  if (!_supabase) {
    const module = await import("@/integrations/supabase/client");
    _supabase = module.supabase;
  }
  return _supabase;
};

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
    const previousConfig = this.directConfig;
    this.directConfig = config ? {
      ...config,
      baseUrl: config.baseUrl.replace(/\/+$/, '')
    } : null;
    
    if (config) {
      console.log('[HA Proxy] Direct config SET:', { 
        baseUrl: config.baseUrl,
        hasToken: !!config.accessToken,
        previouslyConfigured: !!previousConfig
      });
    } else {
      console.log('[HA Proxy] Direct config CLEARED');
    }
  }

  getDirectConfig(): DirectConfig | null {
    return this.directConfig;
  }

  /**
   * Check if the client is ready to make requests
   */
  isReady(): boolean {
    const ready = this.directConfig !== null;
    if (!ready) {
      console.warn('[HA Proxy] isReady check failed - no direct config');
    }
    return ready;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const supabase = await getSupabase();
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
      const supabase = await getSupabase();
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

  // Direct image fetch from Home Assistant (bypasses proxy)
  private async directImageRequest(path: string): Promise<{ data: string | null; error: string | null }> {
    if (!this.directConfig) {
      console.log('[HA Proxy] No direct config for image fetch');
      return { data: null, error: 'No direct config available' };
    }

    const url = `${this.directConfig.baseUrl}${path}`;
    console.log('[HA Proxy] Direct image fetch:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.directConfig.accessToken}`,
        },
      });

      if (!response.ok) {
        console.warn('[HA Proxy] Direct image fetch failed:', response.status);
        return { data: null, error: `HTTP ${response.status}` };
      }

      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('[HA Proxy] Direct image fetch success');
          resolve({ data: reader.result as string, error: null });
        };
        reader.onerror = () => resolve({ data: null, error: 'Failed to read image' });
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[HA Proxy] Direct image fetch error:', message);
      return { data: null, error: message };
    }
  }

  // Fetch image and return as data URL
  async getImage(path: string): Promise<{ data: string | null; error: string | null }> {
    console.log('[HA Proxy] getImage called with path:', path);
    console.log('[HA Proxy] directConfig available:', !!this.directConfig);
    
    const token = await this.getAuthToken();
    console.log('[HA Proxy] Supabase token available:', !!token);
    
    // If no Supabase session, use direct fetch
    if (!token) {
      console.log('[HA Proxy] No Supabase session, using direct image fetch');
      return this.directImageRequest(path);
    }

    try {
      // Call the edge function directly to get the image
      const supabase = await getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const supabaseUrl = sessionData?.session ? 
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co` : null;
      
      if (!supabaseUrl) {
        console.log('[HA Proxy] No Supabase URL, falling back to direct');
        return this.directImageRequest(path);
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/ha-proxy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, method: 'GET' }),
      });

      if (!response.ok) {
        console.warn('[HA Proxy] Proxy image fetch failed, trying direct:', response.status);
        return this.directImageRequest(path);
      }

      const contentType = response.headers.get('content-type') || '';
      
      // Check if response is an image
      if (contentType.startsWith('image/')) {
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ data: reader.result as string, error: null });
          reader.onerror = () => resolve({ data: null, error: 'Failed to read image' });
          reader.readAsDataURL(blob);
        });
      }

      // If it's JSON, the proxy might have returned an error or data URL
      if (contentType.includes('application/json')) {
        const json = await response.json();
        if (json.error) {
          console.warn('[HA Proxy] Proxy returned error, trying direct:', json.error);
          return this.directImageRequest(path);
        }
        // If the proxy returned a data URL in JSON
        if (typeof json === 'string' && json.startsWith('data:')) {
          return { data: json, error: null };
        }
      }

      // Fallback to direct if proxy response is unexpected
      console.warn('[HA Proxy] Unexpected proxy response, trying direct');
      return this.directImageRequest(path);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[HA Proxy] Image fetch error, trying direct:', message);
      return this.directImageRequest(path);
    }
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
      const supabase = await getSupabase();
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
