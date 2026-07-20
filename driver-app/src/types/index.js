/**
 * @typedef {Object} LocationCoords
 * @property {number} latitude
 * @property {number} longitude
 * @property {number|null} speed
 * @property {number|null} heading
 * @property {number|null} altitude
 * @property {number} timestamp
 */

/**
 * @typedef {Object} TripData
 * @property {string} id
 * @property {string} routeId
 * @property {string} driverId
 * @property {string} busId
 * @property {'SCHEDULED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED'} status
 * @property {string} scheduledStart
 * @property {string|null} actualStart
 * @property {string|null} actualEnd
 * @property {RouteData} route
 * @property {DriverInfo} driver
 * @property {BusInfo} bus
 */

/**
 * @typedef {Object} RouteData
 * @property {string} id
 * @property {string} name
 * @property {string} routeNo
 * @property {string} startLocation
 * @property {string} endLocation
 * @property {number|null} distance
 * @property {number|null} duration
 * @property {StopData[]} stops
 */

/**
 * @typedef {Object} StopData
 * @property {string} id
 * @property {string} name
 * @property {number} sequence
 * @property {string|null} landmark
 */

/**
 * @typedef {Object} DriverInfo
 * @property {string} id
 * @property {string} licenseNo
 * @property {string} status
 * @property {BusInfo|null} assignedBus
 */

/**
 * @typedef {Object} BusInfo
 * @property {string} id
 * @property {string} regNo
 * @property {string} model
 * @property {number} capacity
 */

/**
 * @typedef {'connected'|'disconnected'|'connecting'|'error'} ConnectionStatus
 */

export default {};
