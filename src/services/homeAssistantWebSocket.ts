import {
  createConnection,
  subscribeEntities,
  Connection,
  HassEntities,
  HassEntity,
  getAuth,
  createLongLivedTokenAuth,
} from "home-assistant-js-websocket";

type StateChangeCallback = (state: any) => void;

class HomeAssistantWebSocketService {
  private connection: Connection | null = null;
  private entitySubscription: (() => void) | null = null;
  private listeners: Map<string, Set<StateChangeCallback>> = new Map();
  private isConnecting: boolean = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(baseUrl: string, accessToken: string): Promise<boolean> {
    if (this.isConnecting || this.connection) {
      console.log('🔌 Already connected or connecting to WebSocket');
      return true;
    }

    this.isConnecting = true;
    console.log('🔌 Connecting to Home Assistant WebSocket...');

    try {
      // Create auth using long-lived token
      const auth = createLongLivedTokenAuth(
        baseUrl.replace(/\/+$/, ''),
        accessToken
      );

      // Create WebSocket connection
      this.connection = await createConnection({ auth });
      
      console.log('✅ WebSocket connected successfully!');
      this.reconnectAttempts = 0;

      // Subscribe to ALL entity state changes
      this.entitySubscription = subscribeEntities(this.connection, (entities) => {
        this.handleEntitiesUpdate(entities);
      });

      // Handle disconnection
      this.connection.addEventListener('disconnected', () => {
        console.warn('⚠️  WebSocket disconnected');
        this.handleDisconnect();
      });

      this.isConnecting = false;
      return true;
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.isConnecting = false;
      this.connection = null;
      throw error;
    }
  }

  private handleEntitiesUpdate(entities: HassEntities) {
    // Notify all subscribed listeners when entities change
    Object.entries(entities).forEach(([entityId, state]) => {
      const listeners = this.listeners.get(entityId);
      if (listeners && listeners.size > 0) {
        listeners.forEach(callback => {
          try {
            callback(state);
          } catch (error) {
            console.error(`Error in listener for ${entityId}:`, error);
          }
        });
      }
    });
  }

  private async handleDisconnect() {
    this.connection = null;
    this.entitySubscription = null;

    // Attempt to reconnect with exponential backoff
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        // Reconnect logic would need config - for now just log
        console.log('Reconnection needs to be triggered from context with config');
      }, delay);
    }
  }

  subscribe(entityId: string, callback: StateChangeCallback): () => void {
    if (!this.listeners.has(entityId)) {
      this.listeners.set(entityId, new Set());
    }
    
    const listeners = this.listeners.get(entityId)!;
    listeners.add(callback);

    console.log(`👂 Subscribed to ${entityId} (${listeners.size} listeners)`);

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(entityId);
      }
      console.log(`🔕 Unsubscribed from ${entityId}`);
    };
  }

  async getEntityState(entityId: string): Promise<HassEntity | null> {
    if (!this.connection) return null;
    
    try {
      const states = await this.connection.sendMessagePromise({
        type: 'get_states',
      });
      
      const entity = (states as HassEntity[]).find(e => e.entity_id === entityId);
      return entity || null;
    } catch (error) {
      console.error(`Failed to get state for ${entityId}:`, error);
      return null;
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');
    
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
  }

  isConnected(): boolean {
    return this.connection !== null;
  }
}

// Singleton instance
export const websocketService = new HomeAssistantWebSocketService();
