// =============================================================
// src/controllers/driver.controller.js
// CRUD operations for Driver resource
// =============================================================

const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

// Reusable driver select fields
const DRIVER_SELECT = {
  id: true,
  licenseNo: true,
  experience: true,
  status: true,
  assignedBusId: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true, phone: true } },
  assignedBus: { select: { id: true, regNo: true, model: true } },
};

// ─────────────────────────────────────────────
// GET /api/v1/drivers
// ─────────────────────────────────────────────
const getAllDrivers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [drivers, total] = await prisma.$transaction([
      prisma.driver.findMany({
        where,
        select: DRIVER_SELECT,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.driver.count({ where }),
    ]);

    return sendSuccess(res, {
      drivers,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/v1/drivers/:id
// ─────────────────────────────────────────────
const getDriverById = async (req, res, next) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      select: DRIVER_SELECT,
    });

    if (!driver) return sendError(res, 'Driver not found.', 404);
    return sendSuccess(res, driver);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/v1/drivers
// ─────────────────────────────────────────────
const createDriver = async (req, res, next) => {
  try {
    const { userId, licenseNo, experience, status, assignedBusId } = req.body;

    // Verify the linked user exists and has the DRIVER role
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return sendError(res, 'User not found.', 404);
    if (user.role !== 'DRIVER') {
      return sendError(res, 'User must have the DRIVER role.', 400);
    }

    // Check for duplicate license
    const dupLicense = await prisma.driver.findUnique({ where: { licenseNo } });
    if (dupLicense) return sendError(res, 'License number already exists.', 409);

    const driver = await prisma.driver.create({
      data: { userId, licenseNo, experience: experience || 0, status, assignedBusId },
      select: DRIVER_SELECT,
    });

    return sendSuccess(res, driver, 'Driver created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PUT /api/v1/drivers/:id
// ─────────────────────────────────────────────
const updateDriver = async (req, res, next) => {
  try {
    const existing = await prisma.driver.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Driver not found.', 404);

    const { licenseNo, experience, status, assignedBusId } = req.body;
    const data = {};
    if (licenseNo !== undefined) data.licenseNo = licenseNo;
    if (experience !== undefined) data.experience = experience;
    if (status !== undefined) data.status = status;
    if (assignedBusId !== undefined) data.assignedBusId = assignedBusId;

    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data,
      select: DRIVER_SELECT,
    });

    return sendSuccess(res, driver, 'Driver updated successfully.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/v1/drivers/:id
// ─────────────────────────────────────────────
const deleteDriver = async (req, res, next) => {
  try {
    const existing = await prisma.driver.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Driver not found.', 404);

    await prisma.driver.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Driver deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllDrivers, getDriverById, createDriver, updateDriver, deleteDriver };
