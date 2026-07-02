// =============================================================
// src/controllers/bus.controller.js
// CRUD operations for Bus resource
// =============================================================

const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

const BUS_SELECT = {
  id: true,
  regNo: true,
  model: true,
  capacity: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { drivers: true } },
};

// GET /api/v1/buses
const getAllBuses = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [buses, total] = await prisma.$transaction([
      prisma.bus.findMany({
        where,
        select: BUS_SELECT,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bus.count({ where }),
    ]);

    return sendSuccess(res, {
      buses,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/buses/:id
const getBusById = async (req, res, next) => {
  try {
    const bus = await prisma.bus.findUnique({
      where: { id: req.params.id },
      select: { ...BUS_SELECT, drivers: { select: { id: true, licenseNo: true, status: true } } },
    });

    if (!bus) return sendError(res, 'Bus not found.', 404);
    return sendSuccess(res, bus);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/buses
const createBus = async (req, res, next) => {
  try {
    const { regNo, model, capacity, status } = req.body;

    const dup = await prisma.bus.findUnique({ where: { regNo } });
    if (dup) return sendError(res, 'Registration number already exists.', 409);

    const bus = await prisma.bus.create({
      data: { regNo, model, capacity: parseInt(capacity), status },
      select: BUS_SELECT,
    });

    return sendSuccess(res, bus, 'Bus created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/buses/:id
const updateBus = async (req, res, next) => {
  try {
    const existing = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Bus not found.', 404);

    const { regNo, model, capacity, status } = req.body;
    const data = {};
    if (regNo !== undefined) data.regNo = regNo;
    if (model !== undefined) data.model = model;
    if (capacity !== undefined) data.capacity = parseInt(capacity);
    if (status !== undefined) data.status = status;

    const bus = await prisma.bus.update({
      where: { id: req.params.id },
      data,
      select: BUS_SELECT,
    });

    return sendSuccess(res, bus, 'Bus updated successfully.');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/buses/:id
const deleteBus = async (req, res, next) => {
  try {
    const existing = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Bus not found.', 404);

    await prisma.bus.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Bus deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllBuses, getBusById, createBus, updateBus, deleteBus };
