import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
const RECONNECTION_ATTEMPTS = Infinity;
const RECONNECTION_DELAY = 2000;

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
  }

  connect(driverId, tripId, routeId) {
    if (this.socket?.connected) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: RECONNECTION_ATTEMPTS,
      reconnectionDelay: RECONNECTION_DELAY,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.emit('driver:join', { driverId, tripId, routeId });
      this.notifyListeners('connection', 'connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.notifyListeners('connection', 'disconnected');
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      this.notifyListeners('connection', 'error');
    });

    this.socket.on('reconnect_attempt', () => {
      this.notifyListeners('connection', 'connecting');
    });

    this.socket.on('reconnect', () => {
      this.isConnected = true;
      this.emit('driver:join', { driverId, tripId, routeId });
      this.notifyListeners('connection', 'connected');
    });
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners = {};
  }
}

const socketService = new SocketService();
export default socketService;
