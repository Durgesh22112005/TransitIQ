// =============================================================
// src/app.js
// Express application factory
// =============================================================

require('./config/env');           // validates env vars at boot

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes   = require('./routes/auth.routes');
const driverRoutes = require('./routes/driver.routes');
const busRoutes    = require('./routes/bus.routes');
const routeRoutes  = require('./routes/route.routes');
const stopRoutes   = require('./routes/stop.routes');
const tripRoutes   = require('./routes/trip.routes');

const { notFound, globalErrorHandler } = require('./middleware/error.middleware');
const { ALLOWED_ORIGINS, NODE_ENV } = require('./config/env');

const app = express();

// ─── Security ────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed.`));
    },
    credentials: true,
  })
);

// ─── Logging ──────────────────────────────────
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body Parsing ─────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'TransitIQ API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Swagger UI ──────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'TransitIQ API Docs',
}));

// ─── API Routes ───────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`,    authRoutes);
app.use(`${API}/drivers`, driverRoutes);
app.use(`${API}/buses`,   busRoutes);
app.use(`${API}/routes`,  routeRoutes);
app.use(`${API}/stops`,   stopRoutes);
app.use(`${API}/trips`,   tripRoutes);

// ─── 404 & Global Error Handler ───────────────
app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
