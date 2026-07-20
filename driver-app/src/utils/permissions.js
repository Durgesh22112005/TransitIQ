import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export const LOCATION_PERMISSION_STATUS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  UNDETERMINED: 'undetermined',
  DISABLED: 'disabled',
};

const openAppSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

export const showPermissionAlert = (title, message) => {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Open Settings', onPress: () => { openAppSettings(); resolve(false); } },
      ]
    );
  });
};

export const requestForegroundPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status;
  } catch (error) {
    return LOCATION_PERMISSION_STATUS.DENIED;
  }
};

export const requestBackgroundPermission = async () => {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    return status;
  } catch (error) {
    return LOCATION_PERMISSION_STATUS.DENIED;
  }
};

export const checkLocationEnabled = async () => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch {
    return false;
  }
};

export const ensureLocationPermissions = async () => {
  const enabled = await checkLocationEnabled();
  if (!enabled) {
    await showPermissionAlert(
      'GPS Disabled',
      'Location services are turned off. Please enable GPS to start tracking.'
    );
    return { permission: LOCATION_PERMISSION_STATUS.DISABLED, background: false };
  }

  const foreground = await requestForegroundPermission();
  if (foreground !== 'granted') {
    await showPermissionAlert(
      'Permission Required',
      'Location permission is needed for live tracking. Please grant access.'
    );
    return { permission: LOCATION_PERMISSION_STATUS.DENIED, background: false };
  }

  const background = await requestBackgroundPermission();

  return { permission: LOCATION_PERMISSION_STATUS.GRANTED, background: background === 'granted' };
};
