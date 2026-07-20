import { tripAPI } from './api.service';

class TripService {
  constructor() {
    this.currentTrip = null;
    this.loading = false;
    this.error = null;
  }

  async fetchCurrentTrip() {
    try {
      this.loading = true;
      this.error = null;
      const response = await tripAPI.getCurrent();
      this.currentTrip = response?.data?.trip || null;
      return this.currentTrip;
    } catch (error) {
      this.error = error.message || 'Failed to fetch trip data.';
      this.currentTrip = null;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async startTrip(tripId) {
    try {
      this.loading = true;
      this.error = null;
      const response = await tripAPI.start(tripId);
      this.currentTrip = response?.data || null;
      return { success: true, trip: this.currentTrip };
    } catch (error) {
      this.error = error.message || 'Failed to start trip.';
      return { success: false, error: this.error };
    } finally {
      this.loading = false;
    }
  }

  async endTrip(tripId) {
    try {
      this.loading = true;
      this.error = null;
      const response = await tripAPI.end(tripId);
      this.currentTrip = null;
      return { success: true, data: response?.data || null };
    } catch (error) {
      this.error = error.message || 'Failed to end trip.';
      return { success: false, error: this.error };
    } finally {
      this.loading = false;
    }
  }

  reset() {
    this.currentTrip = null;
    this.loading = false;
    this.error = null;
  }
}

const tripService = new TripService();
export default tripService;
