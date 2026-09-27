import { useState, useEffect, useRef } from 'react';
import passengerSocketService from '../services/PassengerSocketService';

const useMultiBusTracking = (tripIds) => {
  const [busLocations, setBusLocations] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const mountedRef = useRef(true);

  const idsKey = Array.isArray(tripIds) ? tripIds.filter(Boolean).sort().join(',') : '';

  useEffect(() => {
    if (!idsKey) return;
    mountedRef.current = true;
    const ids = idsKey.split(',').filter(Boolean);

    const onLocation = (data) => {
      if (!mountedRef.current) return;
      if (!ids.includes(data.tripId)) return;
      setBusLocations((prev) => ({
        ...prev,
        [data.tripId]: {
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          heading: data.heading,
          timestamp: data.timestamp,
        },
      }));
    };

    const onConnection = (status) => {
      if (mountedRef.current) setConnectionStatus(status);
    };

    passengerSocketService.on('location:update', onLocation);
    passengerSocketService.on('connection', onConnection);
    passengerSocketService.connect(ids);

    return () => {
      mountedRef.current = false;
      passengerSocketService.off('location:update', onLocation);
      passengerSocketService.off('connection', onConnection);
      setBusLocations({});
      setConnectionStatus('disconnected');
    };
  }, [idsKey]);

  return { busLocations, connectionStatus };
};

export default useMultiBusTracking;
