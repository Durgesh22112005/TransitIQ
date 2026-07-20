import * as Location from 'expo-location';
import { ensureLocationPermissions } from '../utils/permissions';

const LOCATION_UPDATE_INTERVAL = 5000;
const MIN_DISPLACEMENT_METERS = 10;

let locationSubscription = null;
let lastLocation = null;

export const startTracking = async (onLocationUpdate, onError) => {
  const permResult = await ensureLocationPermissions();
  if (permResult.permission !== 'granted') {
    if (onError) onError(new Error('Location permission not granted.'));
    return null;
  }

  if (locationSubscription) {
    await stopTracking();
  }

  try {
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: LOCATION_UPDATE_INTERVAL,
        distanceInterval: MIN_DISPLACEMENT_METERS,
      },
      (locationData) => {
        const { coords, timestamp } = locationData;
        const current = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          speed: coords.speed,
          heading: coords.heading,
          altitude: coords.altitude,
          accuracy: coords.accuracy,
          timestamp: timestamp || Date.now(),
        };

        if (lastLocation) {
          const distance = calculateDistance(
            lastLocation.latitude, lastLocation.longitude,
            current.latitude, current.longitude
          );
          if (distance < MIN_DISPLACEMENT_METERS) {
            return;
          }
        }

        lastLocation = current;
        if (onLocationUpdate) onLocationUpdate(current);
      }
    );

    return locationSubscription;
  } catch (error) {
    if (onError) onError(error);
    return null;
  }
};

export const stopTracking = async () => {
  if (locationSubscription) {
    try {
      await locationSubscription.remove();
    } catch {
    }
    locationSubscription = null;
  }
  lastLocation = null;
};

export const getCurrentPosition = async () => {
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { coords, timestamp } = position;
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      speed: coords.speed,
      heading: coords.heading,
      altitude: coords.altitude,
      accuracy: coords.accuracy,
      timestamp: timestamp || Date.now(),
    };
  } catch (error) {
    throw error;
  }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => (deg * Math.PI) / 180;
