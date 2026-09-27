import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const usePassengerLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const watcherId = useRef(null);

  useEffect(() => {
    let mounted = true;

    const startWebLocation = () => {
      if (!navigator.geolocation) {
        console.warn('[PassengerLocation] navigator.geolocation not available');
        setError('Geolocation not supported');
        return;
      }

      console.log('[PassengerLocation] Starting web geolocation...');

      const onSuccess = (pos) => {
        console.log('[PassengerLocation] Got position:', pos.coords.latitude, pos.coords.longitude);
        if (mounted) {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      };

      const onError = (err) => {
        console.warn('[PassengerLocation] Error:', err.code, err.message);
        if (mounted) setError(err.message);
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 30000,
      });

      watcherId.current = navigator.geolocation.watchPosition(
        onSuccess,
        () => {},
        { enableHighAccuracy: false, timeInterval: 15000, distanceInterval: 100 }
      );
    };

    const startNativeLocation = async () => {
      try {
        const Location = require('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) setError('Location permission denied');
          return;
        }

        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }).catch(() => null);

        if (initial && mounted) {
          setLocation({
            latitude: initial.coords.latitude,
            longitude: initial.coords.longitude,
          });
        }

        watcherId.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 50 },
          (pos) => {
            if (mounted) {
              setLocation({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            }
          }
        );
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to get location');
      }
    };

    if (Platform.OS === 'web') {
      startWebLocation();
    } else {
      startNativeLocation();
    }

    return () => {
      mounted = false;
      if (Platform.OS === 'web' && watcherId.current != null) {
        navigator.geolocation.clearWatch(watcherId.current);
      } else if (watcherId.current?.remove) {
        watcherId.current.remove();
      }
    };
  }, []);

  return { location, error };
};

export default usePassengerLocation;
