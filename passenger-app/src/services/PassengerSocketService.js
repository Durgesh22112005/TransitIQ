import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class PassengerSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
    this.tripIds = [];
  }

  connect(tripIds) {
    const ids = Array.isArray(tripIds) ? tripIds : [tripIds].filter(Boolean);
    if (ids.length === 0) return;

    ids.forEach((id) => {
      if (!this.tripIds.includes(id)) this.tripIds.push(id);
    });

    if (this.socket?.connected) {
      this.joinRooms();
      return;
    }

    if (this.socket) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.joinRooms();
      this.notifyListeners('connection', 'connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.notifyListeners('connection', 'disconnected');
    });

    this.socket.on('connect_error', () => {
      this.isConnected = false;
      this.notifyListeners('connection', 'error');
    });

    this.socket.on('reconnect_attempt', () => {
      this.notifyListeners('connection', 'connecting');
    });

    this.socket.on('reconnect', () => {
      this.isConnected = true;
      this.joinRooms();
      this.notifyListeners('connection', 'connected');
    });

    this.socket.on('location:updated', (data) => {
      this.notifyListeners('location:update', data);
    });

    this.socket.on('trip:ended', (data) => {
      this.tripIds = this.tripIds.filter((id) => id !== data.tripId);
      this.notifyListeners('trip:end', data);
    });
  }

  joinRooms() {
    if (!this.socket || !this.isConnected) return;
    this.tripIds.forEach((tripId) => {
      this.socket.emit('passenger:join', { tripId });
    });
  }

  addTrip(tripId) {
    if (!tripId || this.tripIds.includes(tripId)) return;
    this.tripIds.push(tripId);
    if (this.socket && this.isConnected) {
      this.socket.emit('passenger:join', { tripId });
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.tripIds = [];
    this.listeners = {};
  }
}

const passengerSocketService = new PassengerSocketService();
export default passengerSocketService;
