import {
  createConnection,
  subscribeEntities,
  Connection,
  HassEntities,
  HassEntity,
  createLongLivedTokenAuth,
} from "home-assistant-js-websocket";
import { logger } from '@/shared/utils/logger';
import type { HAConfig } from './types';

type StateChangeCallback = (state: HassEntity) => void;

/**
 * Home Assistant WebSocket Service
 * Manages real-time entity state subscriptions via WebSocket
 */
class HomeAssistantWebSocketService {
  private connection: Connection | null = null;
  private entitySubscription: (() => void) | null = null;
  private listeners: Map<string, Set<StateChangeCallback>> = new Map();
  private isConnecting: boolean = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectConfig: HAConfig | null = null;

  /**
   * Connect to Home Assistant WebSocket
   */
  async connect(config: HAConfig): Promise<boolean> {
    if (this.isConnecting || this.connection) {
      logger.connection('Already connected or connecting to WebSocket');
      return true;
    }

    this.isConnecting = true;
    this.reconnectConfig = config;
    logger.connection('Connecting to Home Assistant WebSocket...');

    try {
      const auth = createLongLivedTokenAuth(
        config.baseUrl.replace(/\/+$/, ''),
        config.accessToken
      );

      this.connection = await createConnection({ auth });
      
      logger.connection('WebSocket connected successfully');
      this.reconnectAttempts = 0;

      // Subscribe to all entity state changes
      this.entitySubscription = subscribeEntities(this.connection, (entities) => {
        this.handleEntitiesUpdate(entities);
      });

      // Handle disconnection
      this.connection.addEventListener('disconnected', () => {
        logger.warn('WebSocket disconnected');
        this.handleDisconnect();
      });

      this.isConnecting = false;
      return true;
    } catch (error) {
      logger.error('WebSocket connection failed', error);
      this.isConnecting = false;
      this.connection = null;
      throw error;
    }
  }

  /**
   * Handle entity updates from WebSocket
   */
  private handleEntitiesUpdate(entities: HassEntities) {
    Object.entries(entities).forEach(([entityId, state]) => {
      const listeners = this.listeners.get(entityId);
      if (listeners && listeners.size > 0) {
        listeners.forEach(callback => {
          try {
            callback(state as HassEntity);
          } catch (error) {
            logger.error(`Error in listener for ${entityId}`, error);
          }
        });
      }
    });
  }

  /**
   * Handle disconnection with exponential backoff
   */
  private async handleDisconnect() {
    this.connection = null;
    this.entitySubscription = null;

    if (this.reconnectAttempts < this.maxReconnectAttempts && this.reconnectConfig) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      logger.connection(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(async () => {
        if (this.reconnectConfig) {
          try {
            await this.connect(this.reconnectConfig);
          } catch (error) {
            logger.error('Reconnection failed', error);
          }
        }
      }, delay);
    } else {
      logger.error('Max reconnection attempts reached');
    }
  }

  /**
   * Subscribe to entity state changes
   */
  subscribe(entityId: string, callback: StateChangeCallback): () => void {
    if (!this.listeners.has(entityId)) {
      this.listeners.set(entityId, new Set());
    }
    
    const listeners = this.listeners.get(entityId)!;
    listeners.add(callback);

    logger.sync(`Subscribed to ${entityId} (${listeners.size} listeners)`);

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(entityId);
      }
      logger.sync(`Unsubscribed from ${entityId}`);
    };
  }

  /**
   * Get entity state via WebSocket
   */
  async getEntityState(entityId: string): Promise<HassEntity | null> {
    if (!this.connection) return null;
    
    try {
      const states = await this.connection.sendMessagePromise({
        type: 'get_states',
      });
      
      const entity = (states as HassEntity[]).find(e => e.entity_id === entityId);
      return entity || null;
    } catch (error) {
      logger.error(`Failed to get state for ${entityId}`, error);
      return null;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    logger.connection('Disconnecting WebSocket...');
    
    if (this.entitySubscription) {
      this.entitySubscription();
      this.entitySubscription = null;
    }

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }

    this.listeners.clear();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectConfig = null;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connection !== null;
  }

  /**
   * Get reconnection status
   */
  isReconnecting(): boolean {
    return this.reconnectAttempts > 0 && this.reconnectAttempts < this.maxReconnectAttempts;
  }
}

// Export singleton instance
export const websocketService = new HomeAssistantWebSocketService();
