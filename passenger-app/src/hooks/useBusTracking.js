import { useState, useEffect, useRef, useCallback } from 'react';
import passengerSocketService from '../services/PassengerSocketService';

const useBusTracking = (tripId) => {
  const [busLocation, setBusLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!tripId) return;
    mountedRef.current = true;

    const onLocation = (data) => {
      if (!mountedRef.current) return;
      if (data.tripId === tripId) {
        setBusLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          heading: data.heading,
          timestamp: data.timestamp,
        });
      }
    };

    const onConnection = (status) => {
      if (mountedRef.current) setConnectionStatus(status);
    };

    passengerSocketService.on('location:update', onLocation);
    passengerSocketService.on('connection', onConnection);

    passengerSocketService.connect(tripId);

    return () => {
      mountedRef.current = false;
      passengerSocketService.off('location:update', onLocation);
      passengerSocketService.off('connection', onConnection);
      passengerSocketService.disconnect();
      setBusLocation(null);
      setConnectionStatus('disconnected');
    };
  }, [tripId]);

  return { busLocation, connectionStatus, error };
};

export default useBusTracking;
