// =============================================================
// src/controllers/stop.controller.js
// CRUD operations for Stop resource
// =============================================================

const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

// GET /api/v1/stops?routeId=...
const getAllStops = async (req, res, next) => {
  try {
    const { routeId } = req.query;
    const where = routeId ? { routeId } : {};

    const stops = await prisma.stop.findMany({
      where,
      include: { route: { select: { id: true, routeNo: true, name: true } } },
      orderBy: [{ routeId: 'asc' }, { sequence: 'asc' }],
    });

    return sendSuccess(res, stops);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/stops/:id
const getStopById = async (req, res, next) => {
  try {
    const stop = await prisma.stop.findUnique({
      where: { id: req.params.id },
      include: { route: { select: { id: true, routeNo: true, name: true } } },
    });

    if (!stop) return sendError(res, 'Stop not found.', 404);
    return sendSuccess(res, stop);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/stops
const createStop = async (req, res, next) => {
  try {
    const { name, routeId, sequence, landmark } = req.body;

    // Verify route exists
    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!route) return sendError(res, 'Route not found.', 404);

    // Check unique constraint (routeId + sequence)
    const dup = await prisma.stop.findUnique({
      where: { routeId_sequence: { routeId, sequence } },
    });
    if (dup) return sendError(res, `Sequence ${sequence} already exists on this route.`, 409);

    const stop = await prisma.stop.create({
      data: { name, routeId, sequence, landmark },
      include: { route: { select: { id: true, routeNo: true, name: true } } },
    });

    return sendSuccess(res, stop, 'Stop created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/stops/:id
const updateStop = async (req, res, next) => {
  try {
    const existing = await prisma.stop.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Stop not found.', 404);

    const { name, sequence, landmark } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (sequence !== undefined) data.sequence = sequence;
    if (landmark !== undefined) data.landmark = landmark;

    const stop = await prisma.stop.update({
      where: { id: req.params.id },
      data,
      include: { route: { select: { id: true, routeNo: true, name: true } } },
    });

    return sendSuccess(res, stop, 'Stop updated successfully.');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/stops/:id
const deleteStop = async (req, res, next) => {
  try {
    const existing = await prisma.stop.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Stop not found.', 404);

    await prisma.stop.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Stop deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllStops, getStopById, createStop, updateStop, deleteStop };
