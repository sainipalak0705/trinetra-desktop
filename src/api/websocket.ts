/**
 * Handshake-Authenticated WebSocket Client for TRINETRA Live SOC Telemetry.
 */
import { API_BASE_URL } from './client';

export type WebSocketEventListener = (eventData: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Set<WebSocketEventListener> = new Set();
  private reconnectTimeout: any = null;
  private reconnectDelay = 1000;
  private isExplicitlyClosed = false;
  private isAuthenticated = false;

  private getWebSocketUrl(): string {
    const base = API_BASE_URL.replace(/^http/, 'ws');
    return `${base}/ws`;
  }

  public connect(): void {
    const token = localStorage.getItem('trinetra_auth_token');
    if (!token) {
      // Cannot connect unauthenticated
      return;
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    const url = this.getWebSocketUrl();

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        // Send application-level auth handshake
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          const authPayload = {
            type: 'auth',
            token: token,
          };
          this.socket.send(JSON.stringify(authPayload));
        }
      };

      this.socket.onmessage = (messageEvent) => {
        try {
          const data = JSON.parse(messageEvent.data);
          
          if (data.type === 'auth_success') {
            this.isAuthenticated = true;
            this.reconnectDelay = 1000;
            return;
          }

          if (data.type === 'auth_error') {
            console.error('[WebSocket] Authentication error:', data.message);
            this.isAuthenticated = false;
            this.disconnect();
            return;
          }

          // Disseminate live backend event payload to all listeners
          this.listeners.forEach((listener) => {
            try {
              listener(data);
            } catch (err) {
              console.error('[WebSocket] Listener error:', err);
            }
          });
        } catch (err) {
          console.error('[WebSocket] Failed parsing incoming payload:', err);
        }
      };

      this.socket.onclose = () => {
        this.isAuthenticated = false;
        this.socket = null;
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.warn('[WebSocket] Connection error:', error);
      };
    } catch (err) {
      console.error('[WebSocket] Exception during connection setup:', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    const token = localStorage.getItem('trinetra_auth_token');
    if (!token) return;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 10000);
      this.connect();
    }, this.reconnectDelay);
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.isAuthenticated = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public subscribe(listener: WebSocketEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public isConnectedAndAuthenticated(): boolean {
    return this.isAuthenticated && this.socket?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
