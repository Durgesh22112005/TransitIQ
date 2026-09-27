// =============================================================
// src/services/simulator.js
// Simulates live bus movement for IN_PROGRESS trips.
// Loads active trips from DB, advances each bus along its route
// path every 5 seconds, and emits location via Socket.IO.
// =============================================================

const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');

const TICK_MS = 5000; // emit every 5 seconds
const STEPS_PER_TICK = 1; // advance 1 point per tick

let intervalRef = null;
let routePaths = {};
let simState = []; // [{ tripId, driverId, path, index, direction }]

const loadPaths = () => {
  try {
    const file = path.join(__dirname, 'route-paths.json');
    routePaths = JSON.parse(fs.readFileSync(file, 'utf-8'));
    console.log(`[Simulator] Loaded ${Object.keys(routePaths).length} route paths`);
  } catch (e) {
    console.log('[Simulator] No route-paths.json found, simulator idle');
    routePaths = {};
  }
};

const initSimState = async () => {
  try {
    const trips = await prisma.trip.findMany({
      where: { status: 'IN_PROGRESS' },
      select: {
        id: true,
        driverId: true,
        route: { select: { routeNo: true } },
      },
    });

    simState = trips
      .filter((t) => routePaths[t.route.routeNo])
      .map((t) => ({
        tripId: t.id,
        driverId: t.driverId,
        path: routePaths[t.route.routeNo],
        index: 0,
        direction: 1, // 1 = forward, -1 = backward (ping-pong)
      }));

    console.log(`[Simulator] Tracking ${simState.length} active trips`);
  } catch (e) {
    console.log('[Simulator] Failed to load trips:', e.message);
    simState = [];
  }
};

const start = (io) => {
  if (intervalRef) return;

  loadPaths();

  // Wait a moment for DB to be ready, then init
  setTimeout(async () => {
    await initSimState();

    intervalRef = setInterval(() => {
      if (simState.length === 0) return;

      for (const bus of simState) {
        const { path: coords, tripId, driverId } = bus;
        if (!coords || coords.length === 0) continue;

        // Advance index (ping-pong at ends)
        bus.index += STEPS_PER_TICK * bus.direction;
        if (bus.index >= coords.length - 1) {
          bus.index = coords.length - 1;
          bus.direction = -1;
        } else if (bus.index <= 0) {
          bus.index = 0;
          bus.direction = 1;
        }

        const [lat, lng] = coords[bus.index];

        // Emit to trip room (same contract as real driver)
        io.to(`trip:${tripId}`).emit('location:updated', {
          driverId,
          tripId,
          latitude: lat,
          longitude: lng,
          speed: 25 + Math.round(Math.random() * 15),
          heading: Math.round(Math.random() * 360),
          timestamp: new Date().toISOString(),
        });
      }
    }, TICK_MS);

    console.log(`[Simulator] Started — emitting every ${TICK_MS / 1000}s`);
  }, 2000);
};

const stop = () => {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    console.log('[Simulator] Stopped');
  }
};

module.exports = { start, stop };
