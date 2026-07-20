import client from './client';

export const dashboardAPI = {
  getStats: async () => {
    const [drivers, buses, routes, stops, trips] = await Promise.all([
      client.get('/drivers', { params: { limit: 1 } }),
      client.get('/buses', { params: { limit: 1 } }),
      client.get('/routes', { params: { limit: 1 } }),
      client.get('/stops', { params: { limit: 1 } }),
      client.get('/trips', { params: { limit: 100 } }),
    ]);

    const tripPagination = trips.data.pagination;
    const allTrips = trips.data.trips || [];

    return {
      totalDrivers: drivers.data.pagination.total || 0,
      totalBuses: buses.data.pagination.total || 0,
      totalRoutes: routes.data.pagination.total || 0,
      totalStops: stops.data.length || stops.data?.pagination?.total || 0,
      scheduledTrips: allTrips.filter((t) => t.status === 'SCHEDULED').length,
      activeTrips: allTrips.filter((t) => t.status === 'IN_PROGRESS').length,
      completedTrips: allTrips.filter((t) => t.status === 'COMPLETED').length,
      recentTrips: allTrips.slice(0, 5),
      recentDrivers: drivers.data.drivers?.slice(0, 5) || [],
    };
  },
};
