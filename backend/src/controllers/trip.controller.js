const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

const TRIP_SELECT = {
  id: true,
  routeId: true,
  driverId: true,
  busId: true,
  status: true,
  scheduledStart: true,
  actualStart: true,
  actualEnd: true,
  createdAt: true,
  route: {
    select: {
      id: true,
      name: true,
      routeNo: true,
      startLocation: true,
      endLocation: true,
      distance: true,
      duration: true,
      stops: { orderBy: { sequence: 'asc' }, select: { id: true, name: true, sequence: true, landmark: true } },
    },
  },
  driver: {
    select: {
      id: true,
      licenseNo: true,
      status: true,
      assignedBus: { select: { id: true, regNo: true, model: true, capacity: true } },
    },
  },
  bus: { select: { id: true, regNo: true, model: true, capacity: true } },
};

const getCurrentTrip = async (req, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        driver: { userId: req.user.id },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      select: TRIP_SELECT,
      orderBy: { scheduledStart: 'asc' },
    });

    if (!trip) {
      return sendSuccess(res, { trip: null }, 'No active trip found.');
    }

    return sendSuccess(res, { trip });
  } catch (error) {
    next(error);
  }
};

const startTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { driver: { select: { userId: true, status: true } } },
    });

    if (!trip) return sendError(res, 'Trip not found.', 404);
    if (trip.driver.userId !== req.user.id) return sendError(res, 'This trip is not assigned to you.', 403);
    if (trip.status !== 'SCHEDULED') return sendError(res, 'Trip is already active or completed.', 400);

    const updated = await prisma.trip.update({
      where: { id },
      data: { status: 'IN_PROGRESS', actualStart: new Date() },
      select: TRIP_SELECT,
    });

    return sendSuccess(res, updated, 'Trip started successfully.');
  } catch (error) {
    next(error);
  }
};

const endTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { driver: { select: { userId: true } } },
    });

    if (!trip) return sendError(res, 'Trip not found.', 404);
    if (trip.driver.userId !== req.user.id) return sendError(res, 'This trip is not assigned to you.', 403);
    if (trip.status !== 'IN_PROGRESS') return sendError(res, 'Trip is not currently active.', 400);

    const updated = await prisma.trip.update({
      where: { id },
      data: { status: 'COMPLETED', actualEnd: new Date() },
      select: TRIP_SELECT,
    });

    return sendSuccess(res, updated, 'Trip completed successfully.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/v1/trips  (admin: list all trips)
// ─────────────────────────────────────────────
const getAllTrips = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [trips, total] = await prisma.$transaction([
      prisma.trip.findMany({
        where,
        select: TRIP_SELECT,
        skip,
        take: parseInt(limit),
        orderBy: { scheduledStart: 'desc' },
      }),
      prisma.trip.count({ where }),
    ]);

    return sendSuccess(res, {
      trips,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/v1/trips  (admin: create trip)
// ─────────────────────────────────────────────
const createTrip = async (req, res, next) => {
  try {
    const { routeId, driverId, busId, scheduledStart } = req.body;

    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!route) return sendError(res, 'Route not found.', 404);

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) return sendError(res, 'Driver not found.', 404);

    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) return sendError(res, 'Bus not found.', 404);

    const trip = await prisma.trip.create({
      data: {
        routeId,
        driverId,
        busId,
        scheduledStart: new Date(scheduledStart),
        status: 'SCHEDULED',
      },
      select: TRIP_SELECT,
    });

    return sendSuccess(res, trip, 'Trip created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PUT /api/v1/trips/:id  (admin: update trip)
// ─────────────────────────────────────────────
const updateTrip = async (req, res, next) => {
  try {
    const existing = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Trip not found.', 404);

    const { routeId, driverId, busId, scheduledStart, status } = req.body;
    const data = {};
    if (routeId !== undefined) data.routeId = routeId;
    if (driverId !== undefined) data.driverId = driverId;
    if (busId !== undefined) data.busId = busId;
    if (scheduledStart !== undefined) data.scheduledStart = new Date(scheduledStart);
    if (status !== undefined) data.status = status;

    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data,
      select: TRIP_SELECT,
    });

    return sendSuccess(res, trip, 'Trip updated successfully.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/v1/trips/:id  (admin: delete trip)
// ─────────────────────────────────────────────
const deleteTrip = async (req, res, next) => {
  try {
    const existing = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Trip not found.', 404);

    await prisma.trip.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Trip deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/v1/trips/active  (passenger: view active trips)
// ─────────────────────────────────────────────
const getActiveTrips = async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { status: 'IN_PROGRESS' },
      select: TRIP_SELECT,
      orderBy: { scheduledStart: 'desc' },
    });

    return sendSuccess(res, { trips });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/v1/trips/:id  (any authenticated user)
// ─────────────────────────────────────────────
const getTripById = async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      select: TRIP_SELECT,
    });
    if (!trip) return sendError(res, 'Trip not found.', 404);
    return sendSuccess(res, trip);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCurrentTrip, startTrip, endTrip, getAllTrips, createTrip, updateTrip, deleteTrip, getActiveTrips, getTripById };
