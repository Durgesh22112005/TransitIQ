# TransitIQ API Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:5000/api/v1`  
> **Authentication:** Bearer JWT token in `Authorization` header

---

## Authentication Flow

```
POST /auth/register  →  returns { user, token }
POST /auth/login     →  returns { user, token }
GET  /auth/me        →  returns current user (requires token)

All protected endpoints require:
  Authorization: Bearer <jwt_token>
```

---

## Standard Response Format

**Success**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error**
```json
{
  "success": false,
  "message": "...",
  "errors": [
    { "field": "email", "message": "Enter a valid email." }
  ]
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK – Request succeeded |
| 201  | Created – Resource created |
| 400  | Bad Request – Invalid input |
| 401  | Unauthorized – Missing or invalid JWT |
| 403  | Forbidden – Insufficient role |
| 404  | Not Found |
| 409  | Conflict – Duplicate resource |
| 422  | Unprocessable Entity – Validation failed |
| 500  | Internal Server Error |

---

## Health Check

### `GET /health`

No authentication required.

**Response 200**
```json
{
  "status": "OK",
  "service": "TransitIQ API",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

---

## Auth Endpoints

### `POST /api/v1/auth/register`

Register a new user account.

**Request Body**
```json
{
  "name":     "John Doe",
  "email":    "john@example.com",
  "password": "SecurePass1",
  "role":     "PASSENGER",
  "phone":    "+919876543210"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | ✅ | 2–80 characters |
| email | string | ✅ | Valid email |
| password | string | ✅ | Min 8 chars, 1 uppercase, 1 digit |
| role | string | ❌ | `ADMIN`, `DRIVER`, `PASSENGER` (default: `PASSENGER`) |
| phone | string | ❌ | Valid mobile number |

**Response 201**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "PASSENGER",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

---

### `POST /api/v1/auth/login`

Authenticate and receive a JWT token.

**Request Body**
```json
{
  "email":    "john@example.com",
  "password": "SecurePass1"
}
```

**Response 200**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "PASSENGER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

---

### `GET /api/v1/auth/me`  🔒

Returns the currently authenticated user's profile.

**Response 200**
```json
{
  "success": true,
  "message": "User profile retrieved.",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "DRIVER",
    "phone": "+91 98765 43210",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "driver": {
      "id": "uuid",
      "licenseNo": "KA-DL-0012345",
      "experience": 5,
      "status": "ACTIVE"
    }
  }
}
```

---

## Driver Endpoints

> 🔒 All endpoints require authentication.  
> ✏️ Create/Update/Delete require `ADMIN` role.

### `GET /api/v1/drivers`

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by `ACTIVE`, `INACTIVE`, `ON_LEAVE` |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

**Response 200**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "drivers": [ { ... } ],
    "pagination": { "total": 25, "page": 1, "limit": 10 }
  }
}
```

---

### `POST /api/v1/drivers`  🔒 ADMIN

**Request Body**
```json
{
  "userId":    "uuid",
  "licenseNo": "KA-DL-0012345",
  "experience": 5,
  "status": "ACTIVE",
  "assignedBusId": "uuid or null"
}
```

**Response 201** – Returns created driver object.

---

### `GET /api/v1/drivers/:id`  🔒

Returns a single driver with user and assigned bus details.

---

### `PUT /api/v1/drivers/:id`  🔒 ADMIN

Updates a driver. Only include fields you want to change.

```json
{
  "status": "ON_LEAVE",
  "experience": 6
}
```

---

### `DELETE /api/v1/drivers/:id`  🔒 ADMIN

Soft-deletes the driver record.

---

## Bus Endpoints

> 🔒 All endpoints require authentication.  
> ✏️ Create/Update/Delete require `ADMIN` role.

### `GET /api/v1/buses`

**Query Parameters:** `status`, `page`, `limit`

### `POST /api/v1/buses`  🔒 ADMIN

```json
{
  "regNo":    "MH 12 AB 1234",
  "model":    "Volvo B9R",
  "capacity": 52,
  "status":   "ACTIVE"
}
```

### `GET /api/v1/buses/:id`
### `PUT /api/v1/buses/:id`  🔒 ADMIN
### `DELETE /api/v1/buses/:id`  🔒 ADMIN

---

## Route Endpoints

> 🔒 All endpoints require authentication.  
> ✏️ Create/Update/Delete require `ADMIN` role.

### `GET /api/v1/routes`

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| status | string | `ACTIVE`, `INACTIVE`, `UNDER_REVIEW` |
| search | string | Full-text search on name, routeNo, locations |
| page | number | Default 1 |
| limit | number | Default 10 |

**Example:** `GET /api/v1/routes?search=airport&status=ACTIVE`

### `POST /api/v1/routes`  🔒 ADMIN

```json
{
  "name":          "Airport Express",
  "routeNo":       "R-042",
  "startLocation": "City Bus Stand",
  "endLocation":   "Airport Terminal 1",
  "distance":      32.5,
  "duration":      45,
  "status":        "ACTIVE"
}
```

### `GET /api/v1/routes/:id`

Returns the route **including its stops** in sequence order.

### `PUT /api/v1/routes/:id`  🔒 ADMIN
### `DELETE /api/v1/routes/:id`  🔒 ADMIN

---

## Stop Endpoints

> 🔒 All endpoints require authentication.  
> ✏️ Create/Update/Delete require `ADMIN` role.

### `GET /api/v1/stops`

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| routeId | UUID | Filter stops by a specific route |

### `POST /api/v1/stops`  🔒 ADMIN

```json
{
  "name":     "MG Road Junction",
  "routeId":  "uuid",
  "sequence": 2,
  "landmark": "Opposite KFC"
}
```

> ⚠️ `sequence` must be unique within a route.

### `GET /api/v1/stops/:id`
### `PUT /api/v1/stops/:id`  🔒 ADMIN
### `DELETE /api/v1/stops/:id`  🔒 ADMIN

---

## Error Examples

**401 Unauthorized**
```json
{ "success": false, "message": "Access denied. No token provided." }
```

**403 Forbidden**
```json
{ "success": false, "message": "Forbidden. You do not have permission to perform this action." }
```

**422 Validation Failed**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "email",    "message": "Enter a valid email address." },
    { "field": "password", "message": "Password must be at least 8 characters." }
  ]
}
```
