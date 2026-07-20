// =============================================================
// src/controllers/route.controller.js
// CRUD operations for Route resource (includes stops)
// =============================================================

const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

// GET /api/v1/routes
const getAllRoutes = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { routeNo: { contains: search } },
        { startLocation: { contains: search } },
        { endLocation: { contains: search } },
      ];
    }

    const [routes, total] = await prisma.$transaction([
      prisma.route.findMany({
        where,
        include: {
          stops: { orderBy: { sequence: 'asc' } },
          _count: { select: { trips: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { routeNo: 'asc' },
      }),
      prisma.route.count({ where }),
    ]);

    return sendSuccess(res, {
      routes,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/routes/:id  (with stops)
const getRouteById = async (req, res, next) => {
  try {
    const route = await prisma.route.findUnique({
      where: { id: req.params.id },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        _count: { select: { trips: true } },
      },
    });

    if (!route) return sendError(res, 'Route not found.', 404);
    return sendSuccess(res, route);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/routes
const createRoute = async (req, res, next) => {
  try {
    const { name, routeNo, startLocation, endLocation, distance, duration, status } = req.body;

    const dup = await prisma.route.findUnique({ where: { routeNo } });
    if (dup) return sendError(res, 'Route number already exists.', 409);

    const route = await prisma.route.create({
      data: { name, routeNo, startLocation, endLocation, distance, duration, status },
      include: { stops: { orderBy: { sequence: 'asc' } } },
    });

    return sendSuccess(res, route, 'Route created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/routes/:id
const updateRoute = async (req, res, next) => {
  try {
    const existing = await prisma.route.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Route not found.', 404);

    const { name, routeNo, startLocation, endLocation, distance, duration, status } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (routeNo !== undefined) data.routeNo = routeNo;
    if (startLocation !== undefined) data.startLocation = startLocation;
    if (endLocation !== undefined) data.endLocation = endLocation;
    if (distance !== undefined) data.distance = distance;
    if (duration !== undefined) data.duration = duration;
    if (status !== undefined) data.status = status;

    const route = await prisma.route.update({
      where: { id: req.params.id },
      data,
      include: { stops: { orderBy: { sequence: 'asc' } } },
    });
    return sendSuccess(res, route, 'Route updated successfully.');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/routes/:id
const deleteRoute = async (req, res, next) => {
  try {
    const existing = await prisma.route.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Route not found.', 404);

    await prisma.route.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Route deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRoutes, getRouteById, createRoute, updateRoute, deleteRoute };
