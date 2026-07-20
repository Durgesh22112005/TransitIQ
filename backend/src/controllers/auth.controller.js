// =============================================================
// src/controllers/auth.controller.js
// Handles register, login, and get-current-user
// =============================================================

const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { signToken } = require('../utils/jwt.util');
const { sendSuccess, sendError } = require('../utils/response.util');

// ─────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if email already in use
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, 'Email is already registered.', 409);
    }

    // Hash password with salt rounds = 12
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'PASSENGER',
        phone: phone || null,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = signToken({ id: user.id, role: user.role });

    return sendSuccess(
      res,
      { user, token },
      'Registration successful.',
      201
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user including hashed password
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = signToken({ id: user.id, role: user.role });

    // Exclude password from response
    const { password: _pw, ...safeUser } = user;

    return sendSuccess(res, { user: safeUser, token }, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/v1/auth/me  (protected)
// ─────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true,
        role: true, phone: true, createdAt: true,
        driver: {
          select: {
            id: true, licenseNo: true,
            experience: true, status: true,
          },
        },
      },
    });

    return sendSuccess(res, user, 'User profile retrieved.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/v1/auth/users  (admin: list users by role)
// ─────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        driver: {
          select: { id: true, licenseNo: true, status: true, assignedBusId: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, getUsers };
