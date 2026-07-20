const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TransitIQ API',
      version: '1.0.0',
      description: 'Real-Time Public Transport Tracking System – Backend API',
      contact: { name: 'TransitIQ Team' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            name:      { type: 'string' },
            email:     { type: 'string', format: 'email' },
            role:      { type: 'string', enum: ['ADMIN', 'DRIVER', 'PASSENGER'] },
            phone:     { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Driver: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            userId:        { type: 'string', format: 'uuid' },
            licenseNo:     { type: 'string' },
            experience:    { type: 'integer' },
            status:        { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'] },
            assignedBusId: { type: 'string', format: 'uuid', nullable: true },
            user:          { $ref: '#/components/schemas/User' },
            assignedBus:   { $ref: '#/components/schemas/Bus' },
          },
        },
        Bus: {
          type: 'object',
          properties: {
            id:       { type: 'string', format: 'uuid' },
            regNo:    { type: 'string' },
            model:    { type: 'string' },
            capacity: { type: 'integer' },
            status:   { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] },
          },
        },
        Route: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            name:           { type: 'string' },
            routeNo:        { type: 'string' },
            startLocation:  { type: 'string' },
            endLocation:    { type: 'string' },
            distance:       { type: 'number', nullable: true },
            duration:       { type: 'integer', nullable: true },
            status:         { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'UNDER_REVIEW'] },
          },
        },
        Stop: {
          type: 'object',
          properties: {
            id:       { type: 'string', format: 'uuid' },
            name:     { type: 'string' },
            routeId:  { type: 'string', format: 'uuid' },
            sequence: { type: 'integer' },
            landmark: { type: 'string', nullable: true },
          },
        },
        Trip: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            routeId:        { type: 'string', format: 'uuid' },
            driverId:       { type: 'string', format: 'uuid' },
            busId:          { type: 'string', format: 'uuid' },
            status:         { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
            scheduledStart: { type: 'string', format: 'date-time' },
            actualStart:    { type: 'string', format: 'date-time', nullable: true },
            actualEnd:      { type: 'string', format: 'date-time', nullable: true },
            route:          { $ref: '#/components/schemas/Route' },
            driver:         { $ref: '#/components/schemas/Driver' },
            bus:            { $ref: '#/components/schemas/Bus' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data:    { type: 'object' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page:  { type: 'integer' },
            limit: { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors:  { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    paths: {
      // ─── AUTH ────────────────────────────────────────
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name:     { type: 'string', example: 'John Doe' },
                    email:    { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', format: 'password', example: 'Passw0rd!' },
                    role:     { type: 'string', enum: ['ADMIN', 'DRIVER', 'PASSENGER'], example: 'PASSENGER' },
                    phone:    { type: 'string', example: '+919876543210' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Registration successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            409: { description: 'Email already registered' },
            422: { description: 'Validation failed' },
          },
        },
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email:    { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', format: 'password', example: 'Passw0rd!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful, returns JWT token' },
            401: { description: 'Invalid email or password' },
          },
        },
      },
      '/api/v1/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'User profile retrieved' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/auth/users': {
        get: {
          tags: ['Auth'],
          summary: 'List users by role (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'role', in: 'query', schema: { type: 'string', enum: ['ADMIN', 'DRIVER', 'PASSENGER'] }, description: 'Filter by role' },
          ],
          responses: {
            200: { description: 'Users list' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
          },
        },
      },

      // ─── DRIVERS ─────────────────────────────────────
      '/api/v1/drivers': {
        get: {
          tags: ['Drivers'],
          summary: 'List all drivers (paginated)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'] } },
            { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit',  in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: { 200: { description: 'Paginated driver list' } },
        },
        post: {
          tags: ['Drivers'],
          summary: 'Create a new driver (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'licenseNo'],
                  properties: {
                    userId:        { type: 'string', format: 'uuid' },
                    licenseNo:     { type: 'string', example: 'DL-2024-12345' },
                    experience:    { type: 'integer', example: 3 },
                    status:        { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'] },
                    assignedBusId: { type: 'string', format: 'uuid', nullable: true },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Driver created' } },
        },
      },
      '/api/v1/drivers/{id}': {
        get: {
          tags: ['Drivers'],
          summary: 'Get driver by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Driver details' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Drivers'],
          summary: 'Update driver (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    licenseNo:     { type: 'string' },
                    experience:    { type: 'integer' },
                    status:        { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'] },
                    assignedBusId: { type: 'string', format: 'uuid', nullable: true },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Driver updated' } },
        },
        delete: {
          tags: ['Drivers'],
          summary: 'Delete driver (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Driver deleted' }, 404: { description: 'Not found' } },
        },
      },

      // ─── BUSES ───────────────────────────────────────
      '/api/v1/buses': {
        get: {
          tags: ['Buses'],
          summary: 'List all buses (paginated)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] } },
            { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit',  in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: { 200: { description: 'Paginated bus list' } },
        },
        post: {
          tags: ['Buses'],
          summary: 'Create a new bus (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['regNo', 'model', 'capacity'],
                  properties: {
                    regNo:    { type: 'string', example: 'KA-01-AB-1234' },
                    model:    { type: 'string', example: 'Tata Starbus' },
                    capacity: { type: 'integer', example: 50 },
                    status:   { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Bus created' } },
        },
      },
      '/api/v1/buses/{id}': {
        get: {
          tags: ['Buses'],
          summary: 'Get bus by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Bus details' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Buses'],
          summary: 'Update bus (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    regNo:    { type: 'string' },
                    model:    { type: 'string' },
                    capacity: { type: 'integer' },
                    status:   { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Bus updated' } },
        },
        delete: {
          tags: ['Buses'],
          summary: 'Delete bus (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Bus deleted' }, 404: { description: 'Not found' } },
        },
      },

      // ─── ROUTES ──────────────────────────────────────
      '/api/v1/routes': {
        get: {
          tags: ['Routes'],
          summary: 'List all routes (paginated, searchable)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'UNDER_REVIEW'] } },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name, routeNo, or locations' },
            { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit',  in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: { 200: { description: 'Paginated route list' } },
        },
        post: {
          tags: ['Routes'],
          summary: 'Create a new route (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'routeNo', 'startLocation', 'endLocation'],
                  properties: {
                    name:           { type: 'string', example: 'City Centre - Bus Terminal' },
                    routeNo:        { type: 'string', example: 'R-101' },
                    startLocation:  { type: 'string', example: 'City Centre' },
                    endLocation:    { type: 'string', example: 'Bus Terminal' },
                    distance:       { type: 'number', example: 12.5 },
                    duration:       { type: 'integer', example: 35 },
                    status:         { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'UNDER_REVIEW'] },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Route created' } },
        },
      },
      '/api/v1/routes/{id}': {
        get: {
          tags: ['Routes'],
          summary: 'Get route by ID (with stops)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Route with stops' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Routes'],
          summary: 'Update route (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name:          { type: 'string' },
                    routeNo:       { type: 'string' },
                    startLocation: { type: 'string' },
                    endLocation:   { type: 'string' },
                    distance:      { type: 'number' },
                    duration:      { type: 'integer' },
                    status:        { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'UNDER_REVIEW'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Route updated' } },
        },
        delete: {
          tags: ['Routes'],
          summary: 'Delete route (Admin only) — cascades to stops',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Route deleted' }, 404: { description: 'Not found' } },
        },
      },

      // ─── STOPS ───────────────────────────────────────
      '/api/v1/stops': {
        get: {
          tags: ['Stops'],
          summary: 'List all stops (filter by routeId)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'routeId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by route' },
          ],
          responses: { 200: { description: 'Stops list sorted by route and sequence' } },
        },
        post: {
          tags: ['Stops'],
          summary: 'Create a new stop (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'routeId', 'sequence'],
                  properties: {
                    name:     { type: 'string', example: 'Railway Station' },
                    routeId:  { type: 'string', format: 'uuid' },
                    sequence: { type: 'integer', example: 1 },
                    landmark: { type: 'string', example: 'Near City Hospital' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Stop created' } },
        },
      },
      '/api/v1/stops/{id}': {
        get: {
          tags: ['Stops'],
          summary: 'Get stop by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Stop details' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Stops'],
          summary: 'Update stop (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name:     { type: 'string' },
                    sequence: { type: 'integer' },
                    landmark: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Stop updated' } },
        },
        delete: {
          tags: ['Stops'],
          summary: 'Delete stop (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Stop deleted' }, 404: { description: 'Not found' } },
        },
      },

      // ─── TRIPS ───────────────────────────────────────
      '/api/v1/trips': {
        get: {
          tags: ['Trips'],
          summary: 'List all trips (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] } },
            { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit',  in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: 'Paginated trip list' } },
        },
        post: {
          tags: ['Trips'],
          summary: 'Create a new trip (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['routeId', 'driverId', 'busId', 'scheduledStart'],
                  properties: {
                    routeId:        { type: 'string', format: 'uuid' },
                    driverId:       { type: 'string', format: 'uuid' },
                    busId:          { type: 'string', format: 'uuid' },
                    scheduledStart: { type: 'string', format: 'date-time', example: '2026-07-20T08:00:00Z' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Trip created' } },
        },
      },
      '/api/v1/trips/active': {
        get: {
          tags: ['Trips'],
          summary: 'List all active (IN_PROGRESS) trips',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Active trips list' } },
        },
      },
      '/api/v1/trips/current': {
        get: {
          tags: ['Trips'],
          summary: 'Get current trip for authenticated driver',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Current trip for driver' } },
        },
      },
      '/api/v1/trips/{id}': {
        get: {
          tags: ['Trips'],
          summary: 'Get trip by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Trip details' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Trips'],
          summary: 'Update trip (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    routeId:        { type: 'string', format: 'uuid' },
                    driverId:       { type: 'string', format: 'uuid' },
                    busId:          { type: 'string', format: 'uuid' },
                    scheduledStart: { type: 'string', format: 'date-time' },
                    status:         { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Trip updated' } },
        },
        delete: {
          tags: ['Trips'],
          summary: 'Delete trip (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Trip deleted' }, 404: { description: 'Not found' } },
        },
      },
      '/api/v1/trips/{id}/start': {
        post: {
          tags: ['Trips'],
          summary: 'Start a trip (assigned driver only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Trip started' },
            400: { description: 'Trip not in SCHEDULED status' },
            403: { description: 'Not your trip' },
            404: { description: 'Trip not found' },
          },
        },
      },
      '/api/v1/trips/{id}/end': {
        post: {
          tags: ['Trips'],
          summary: 'End a trip (assigned driver only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Trip completed' },
            400: { description: 'Trip not in IN_PROGRESS status' },
            403: { description: 'Not your trip' },
            404: { description: 'Trip not found' },
          },
        },
      },

      // ─── HEALTH ──────────────────────────────────────
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check endpoint',
          responses: { 200: { description: 'Service status' } },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
