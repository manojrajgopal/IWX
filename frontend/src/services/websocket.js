class WebSocketService {
  constructor() {
    this.connections = {};
    this.reconnectAttempts = {};
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isReconnecting = {};
  }

  connect(channel, onMessage, onError, onClose) {
    // Check if already connected
    if (this.connections[channel] && this.connections[channel].readyState === WebSocket.OPEN) {
      console.log(`Already connected to ${channel}, reusing existing connection`);
      return this.connections[channel];
    }

    // Clean up existing connection if not connected
    if (this.connections[channel]) {
      try {
        this.connections[channel].close();
      } catch (e) {
        console.log('Error closing existing connection:', e);
      }
      delete this.connections[channel];
    }

    if (this.isReconnecting[channel]) {
      console.log(`Already reconnecting to ${channel}, skipping`);
      return null;
    }

    const token = localStorage.getItem('token');
    // Use the same backend URL as API calls
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws/${channel}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`WebSocket connected to ${channel}`);
        this.reconnectAttempts[channel] = 0;
        this.isReconnecting[channel] = false;

        // Send authentication message if token exists
        setTimeout(() => {
          if (token && ws.readyState === WebSocket.OPEN) {
            console.log(`Sending auth message for ${channel}`);
            try {
              ws.send(JSON.stringify({
                type: 'auth',
                token: token
              }));
              console.log(`Auth message sent successfully for ${channel}`);
            } catch (error) {
              console.error(`Failed to send auth message for ${channel}:`, error);
            }
          } else {
            console.warn(`Cannot send auth message for ${channel}: token=${!!token}, readyState=${ws.readyState}`);
          }
        }, 500);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'auth_success') {
            console.log(`WebSocket authenticated for ${channel}`);
            if (onMessage) onMessage(data);
          } else if (data.type === 'auth_failed') {
            console.error(`WebSocket authentication failed for ${channel}`);
            ws.close(1008, 'Authentication failed');
            return;
          } else if (data.type === 'auth_required') {
            console.log(`WebSocket authentication required for ${channel}`);
          } else if (data.type === 'ping') {
            // Respond to server ping
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          } else if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error on ${channel}:`, error);
        if (onError) {
          onError(error);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected from ${channel}`, event.code, event.reason);
        if (onClose) {
          onClose(event);
        }

        // Only attempt to reconnect if not a normal closure (1000) or auth failure (1008)
        if (event.code !== 1000 && event.code !== 1008 &&
            !this.isReconnecting[channel] &&
            (this.reconnectAttempts[channel] || 0) < this.maxReconnectAttempts) {
          this.attemptReconnect(channel, onMessage, onError, onClose);
        } else {
          this.isReconnecting[channel] = false;
        }
      };

      this.connections[channel] = ws;
      return ws;
    } catch (error) {
      console.error(`Failed to connect to WebSocket ${channel}:`, error);
      if (onError) {
        onError(error);
      }
      return null;
    }
  }

  attemptReconnect(channel, onMessage, onError, onClose) {
    if (this.isReconnecting[channel]) {
      return;
    }

    this.isReconnecting[channel] = true;
    this.reconnectAttempts[channel] = (this.reconnectAttempts[channel] || 0) + 1;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts[channel] - 1), 30000);

    console.log(`Attempting to reconnect to ${channel} in ${delay}ms (attempt ${this.reconnectAttempts[channel]}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.isReconnecting[channel] = false;
      // Only attempt reconnect if we haven't exceeded max attempts
      if (this.reconnectAttempts[channel] < this.maxReconnectAttempts) {
        this.connect(channel, onMessage, onError, onClose);
      } else {
        console.log(`Max reconnection attempts reached for ${channel}`);
        if (onError) {
          onError(new Error(`Failed to reconnect to ${channel} after ${this.maxReconnectAttempts} attempts`));
        }
      }
    }, delay);
  }

  disconnect(channel) {
    if (this.connections[channel]) {
      try {
        this.connections[channel].close(1000, 'Client disconnecting');
      } catch (e) {
        console.log('Error disconnecting:', e);
      }
      delete this.connections[channel];
      this.isReconnecting[channel] = false;
      this.reconnectAttempts[channel] = 0;
    }
  }

  // Force disconnect all connections
  forceDisconnectAll() {
    Object.keys(this.connections).forEach(channel => {
      if (this.connections[channel]) {
        try {
          this.connections[channel].close(1000, 'Force disconnect');
        } catch (e) {
          console.log('Error force disconnecting:', e);
        }
      }
    });
    this.connections = {};
    this.isReconnecting = {};
    this.reconnectAttempts = {};
  }

  disconnectAll() {
    Object.keys(this.connections).forEach(channel => {
      this.disconnect(channel);
    });
  }

  send(channel, data) {
    if (this.connections[channel] && this.connections[channel].readyState === WebSocket.OPEN) {
      this.connections[channel].send(JSON.stringify(data));
      return true;
    } else {
      console.warn(`WebSocket ${channel} is not connected`);
      return false;
    }
  }

  isConnected(channel) {
    return this.connections[channel] && this.connections[channel].readyState === WebSocket.OPEN;
  }

  // Connect to admin dashboard with authentication
  connectAdminDashboard(onMessage, onError, onClose) {
    return this.connect('admin-dashboard', onMessage, onError, onClose);
  }

  // Disconnect from admin dashboard
  disconnectAdminDashboard() {
    this.disconnect('admin-dashboard');
  }
}

// Create and export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
