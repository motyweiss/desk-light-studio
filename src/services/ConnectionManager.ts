/**
 * ConnectionManager - Unified connection management for Home Assistant
 * Single source of truth for connection state, heartbeat, and auto-reconnection
 */

import { websocketService } from '@/api/homeAssistant';
import { homeAssistant } from '@/services/homeAssistant';
import { logger } from '@/shared/utils/logger';

export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
export type ConnectionMode = 'websocket' | 'polling' | 'none';

interface HAConfig {
  baseUrl: string;
  accessToken: string;
}

type ConnectionChangeCallback = (state: ConnectionState, mode: ConnectionMode) => void;

interface ConnectionManagerState {
  state: ConnectionState;
  mode: ConnectionMode;
  lastSuccessfulSync: number;
  reconnectAttempts: number;
}

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_INTERVAL = 60000; // 60 seconds idle check
const MAX_RECONNECT_ATTEMPTS = 5;
const VISIBILITY_SYNC_THRESHOLD = 30000; // 30 seconds hidden before force sync

class ConnectionManager {
  private config: HAConfig | null = null;
  private internalState: ConnectionManagerState = {
    state: 'disconnected',
    mode: 'none',
    lastSuccessfulSync: 0,
    reconnectAttempts: 0,
  };
  
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<ConnectionChangeCallback> = new Set();
  private visibilityHiddenAt: number = 0;
  private isDestroyed = false;

  constructor() {
    // Setup global event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  // ============= Public API =============

  /**
   * Initialize connection with HA config
   */
  async connect(config: HAConfig): Promise<boolean> {
    if (this.isDestroyed) return false;
    
    this.config = config;
    this.internalState.reconnectAttempts = 0;
    this.updateState('connecting', 'none');

    logger.connection('ConnectionManager: Initiating connection...');

    try {
      // Try WebSocket first (no CORS issues)
      const wsSuccess = await this.connectWebSocket();
      
      if (wsSuccess) {
        this.updateState('connected', 'websocket');
        this.startHeartbeat();
        this.startHealthCheck();
        logger.connection('ConnectionManager: WebSocket connected');
        return true;
      }

      // Fallback to HTTP polling
      logger.connection('ConnectionManager: WebSocket failed, trying HTTP...');
      const httpSuccess = await this.testHttpConnection();
      
      if (httpSuccess) {
        this.updateState('connected', 'polling');
        this.startHeartbeat();
        this.startHealthCheck();
        logger.connection('ConnectionManager: HTTP connection established');
        return true;
      }

      this.updateState('disconnected', 'none');
      logger.error('ConnectionManager: All connection methods failed');
      return false;

    } catch (error) {
      logger.error('ConnectionManager: Connection error', error);
      this.updateState('disconnected', 'none');
      return false;
    }
  }

  /**
   * Manually trigger reconnection
   */
  async reconnect(): Promise<boolean> {
    if (!this.config || this.isDestroyed) return false;
    
    logger.connection('ConnectionManager: Manual reconnect requested');
    this.internalState.reconnectAttempts = 0;
    return this.connect(this.config);
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    logger.connection('ConnectionManager: Disconnecting...');
    
    this.stopHeartbeat();
    this.stopHealthCheck();
    this.cancelReconnect();
    
    if (this.internalState.mode === 'websocket') {
      websocketService.disconnect();
    }
    
    this.updateState('disconnected', 'none');
  }

  /**
   * Mark successful sync (call from sync hooks)
   */
  markSuccessfulSync(): void {
    this.internalState.lastSuccessfulSync = Date.now();
  }

  /**
   * Subscribe to connection state changes
   */
  subscribe(callback: ConnectionChangeCallback): () => void {
    this.listeners.add(callback);
    // Immediately notify of current state
    callback(this.internalState.state, this.internalState.mode);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current state
   */
  getState(): Readonly<ConnectionManagerState> {
    return { ...this.internalState };
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.internalState.state === 'connected';
  }

  /**
   * Get connection mode
   */
  getMode(): ConnectionMode {
    return this.internalState.mode;
  }

  /**
   * Destroy manager (cleanup on unmount)
   */
  destroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.listeners.clear();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  // ============= Private Methods =============

  private async connectWebSocket(): Promise<boolean> {
    if (!this.config) return false;
    
    try {
      await websocketService.connect(this.config);
      return websocketService.isConnected();
    } catch (error) {
      logger.warn('ConnectionManager: WebSocket connection failed', error);
      return false;
    }
  }

  private async testHttpConnection(): Promise<boolean> {
    if (!this.config) return false;
    
    try {
      homeAssistant.setConfig(this.config);
      const result = await homeAssistant.testDirectConnection(
        this.config.baseUrl, 
        this.config.accessToken
      );
      return result.success;
    } catch (error) {
      logger.warn('ConnectionManager: HTTP connection test failed', error);
      return false;
    }
  }

  private updateState(state: ConnectionState, mode: ConnectionMode): void {
    const changed = this.internalState.state !== state || this.internalState.mode !== mode;
    
    this.internalState.state = state;
    this.internalState.mode = mode;
    
    if (changed) {
      logger.connection(`ConnectionManager: State changed to ${state} (${mode})`);
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.internalState.state, this.internalState.mode);
      } catch (error) {
        logger.error('ConnectionManager: Listener error', error);
      }
    });
  }

  // ============= Heartbeat =============

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      this.performHeartbeat();
    }, HEARTBEAT_INTERVAL);
    
    logger.connection('ConnectionManager: Heartbeat started');
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private async performHeartbeat(): Promise<void> {
    if (this.isDestroyed || this.internalState.state !== 'connected') return;
    
    try {
      if (this.internalState.mode === 'websocket') {
        // Check WebSocket health
        if (!websocketService.isConnected()) {
          logger.warn('ConnectionManager: WebSocket disconnected, reconnecting...');
          this.scheduleReconnect();
        }
      } else {
        // HTTP health check
        const result = await homeAssistant.testConnection();
        if (!result.success) {
          logger.warn('ConnectionManager: HTTP health check failed, reconnecting...');
          this.scheduleReconnect();
        }
      }
    } catch (error) {
      logger.error('ConnectionManager: Heartbeat error', error);
      this.scheduleReconnect();
    }
  }

  // ============= Health Check (Idle Detection) =============

  private startHealthCheck(): void {
    this.stopHealthCheck();
    
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, HEALTH_CHECK_INTERVAL);
  }

  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  private performHealthCheck(): void {
    if (this.isDestroyed) return;
    
    const timeSinceLastSync = Date.now() - this.internalState.lastSuccessfulSync;
    
    // If no sync for over 60 seconds and we think we're connected
    if (timeSinceLastSync > HEALTH_CHECK_INTERVAL && this.internalState.state === 'connected') {
      logger.warn('ConnectionManager: No sync for 60s, verifying connection...');
      this.performHeartbeat();
    }
  }

  // ============= Reconnection =============

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.isDestroyed) return;
    
    if (this.internalState.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logger.error('ConnectionManager: Max reconnection attempts reached');
      this.updateState('disconnected', 'none');
      return;
    }

    this.internalState.reconnectAttempts++;
    this.updateState('reconnecting', this.internalState.mode);
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(1000 * Math.pow(2, this.internalState.reconnectAttempts - 1), 30000);
    
    logger.connection(`ConnectionManager: Scheduling reconnect in ${delay}ms (attempt ${this.internalState.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      
      if (this.config && !this.isDestroyed) {
        const success = await this.connect(this.config);
        
        if (!success && this.internalState.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          this.scheduleReconnect();
        }
      }
    }, delay);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ============= Event Handlers =============

  private handleOnline = (): void => {
    logger.connection('ConnectionManager: Network online');
    
    if (this.config && this.internalState.state !== 'connected') {
      this.internalState.reconnectAttempts = 0;
      this.connect(this.config);
    }
  };

  private handleOffline = (): void => {
    logger.connection('ConnectionManager: Network offline');
    this.updateState('disconnected', 'none');
    this.cancelReconnect();
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.visibilityHiddenAt = Date.now();
      logger.connection('ConnectionManager: Tab hidden');
    } else {
      const hiddenDuration = Date.now() - this.visibilityHiddenAt;
      logger.connection(`ConnectionManager: Tab visible (was hidden for ${Math.round(hiddenDuration / 1000)}s)`);
      
      // If tab was hidden for more than 30 seconds, verify connection and sync
      if (hiddenDuration > VISIBILITY_SYNC_THRESHOLD && this.config) {
        if (this.internalState.state === 'connected') {
          // Just verify connection with heartbeat
          this.performHeartbeat();
        } else {
          // Try to reconnect
          this.internalState.reconnectAttempts = 0;
          this.connect(this.config);
        }
      }
    }
  };
}

// Export singleton instance
export const connectionManager = new ConnectionManager();
