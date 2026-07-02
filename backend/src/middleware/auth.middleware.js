// =============================================================
// src/middleware/auth.middleware.js
// JWT authentication & role-based access control
// =============================================================

const { verifyToken } = require('../utils/jwt.util');
const { sendError } = require('../utils/response.util');
const prisma = require('../config/db');

/**
 * authenticate – verifies the Bearer JWT token in the Authorization header.
 * Attaches the full user object to req.user on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch fresh user from DB to ensure account still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return sendError(res, 'User no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid token.', 401);
  }
};

/**
 * authorise – restricts access to specified roles only.
 * Must be called after authenticate.
 * @param  {...string} roles - Allowed role names (e.g. 'ADMIN', 'DRIVER')
 */
const authorise = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        'Forbidden. You do not have permission to perform this action.',
        403
      );
    }
    next();
  };
};

module.exports = { authenticate, authorise };
