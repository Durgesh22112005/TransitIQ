import { useState, useEffect, useRef, useCallback } from 'react';
import { startTracking, stopTracking, getCurrentPosition } from '../services/LocationService';
import socketService from '../services/SocketService';
import tripService from '../services/TripService';

const LOCATION_EMIT_INTERVAL = 5000;

const useLocationTracking = (tripId, driverId, routeId, isActive) => {
  const [location, setLocation] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tripStarted, setTripStarted] = useState(false);

  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    if (!isActive || !tripId) return;

    let mounted = true;

    socketService.on('connection', (status) => {
      if (mounted) setConnectionStatus(status);
    });

    const start = async () => {
      const initial = await getCurrentPosition().catch(() => null);
      if (initial && mounted) {
        setLocation(initial);
        locationRef.current = initial;
      }

      await startTracking(
        (loc) => {
          if (mounted) {
            setLocation(loc);
            setGpsActive(true);
          }
          locationRef.current = loc;
        },
        (err) => {
          if (mounted) {
            setError(err.message || 'GPS error');
            setGpsActive(false);
          }
        }
      );

      if (mounted) {
        setGpsActive(true);
        setTripStarted(true);
      }

      socketService.connect(driverId, tripId, routeId);

      intervalRef.current = setInterval(() => {
        const currentLoc = locationRef.current;
        if (socketService.isConnected && currentLoc) {
          socketService.emit('location:update', {
            driverId,
            tripId,
            latitude: currentLoc.latitude,
            longitude: currentLoc.longitude,
            speed: currentLoc.speed,
            heading: currentLoc.heading,
            timestamp: new Date().toISOString(),
          });
        }
      }, LOCATION_EMIT_INTERVAL);

      timerRef.current = setInterval(() => {
        if (mounted) setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    };

    start();

    return () => {
      mounted = false;
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      stopTracking();
      setGpsActive(false);
      setTripStarted(false);
    };
  }, [isActive, tripId, driverId, routeId]);

  const endTrip = useCallback(async () => {
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);

    if (socketService.isConnected) {
      socketService.emit('trip:end', { driverId, tripId });
    }

    socketService.disconnect();
    await stopTracking();

    const result = await tripService.endTrip(tripId);

    setGpsActive(false);
    setTripStarted(false);
    setConnectionStatus('disconnected');
    setLocation(null);
    setElapsedSeconds(0);

    return result;
  }, [driverId, tripId]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    location,
    gpsActive,
    connectionStatus,
    error,
    elapsedSeconds,
    tripStarted,
    endTrip,
    formatTime: formatTime(elapsedSeconds),
  };
};

export default useLocationTracking;
