const { Server } = require('socket.io');

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('driver:join', (data) => {
      console.log(`[Socket] Driver joined: ${JSON.stringify(data)}`);
      const { driverId, tripId, routeId } = data;
      socket.join(`driver:${driverId}`);
      socket.join(`trip:${tripId}`);
      socket.join(`route:${routeId}`);
    });

    socket.on('location:update', (data) => {
      const { driverId, tripId } = data;
      io.to(`trip:${tripId}`).emit('location:updated', data);
      io.to(`driver:${driverId}`).emit('location:ack', {
        driverId,
        tripId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('trip:end', (data) => {
      console.log(`[Socket] Trip ended: ${JSON.stringify(data)}`);
      const { driverId, tripId } = data;
      io.to(`trip:${tripId}`).emit('trip:ended', data);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

module.exports = setupSocket;
