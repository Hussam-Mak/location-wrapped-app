import * as Location from 'expo-location';
import { LOCATION_TASK_NAME, TRACKING_CONFIG } from '@/constants/tracking';

export async function getPermissionState(): Promise<{
  foreground: 'granted' | 'denied' | 'undetermined';
  background: 'granted' | 'denied' | 'undetermined';
  servicesEnabled: boolean;
}> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  const foreground = await Location.getForegroundPermissionsAsync();
  const background = await Location.getBackgroundPermissionsAsync();

  return {
    foreground: foreground.status,
    background: background.status,
    servicesEnabled,
  };
}

export async function requestForegroundPermission(): Promise<boolean> {
  const result = await Location.requestForegroundPermissionsAsync();
  return result.status === 'granted';
}

export async function requestBackgroundPermission(): Promise<boolean> {
  const foreground = await Location.getForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    const requested = await Location.requestForegroundPermissionsAsync();
    if (requested.status !== 'granted') return false;
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  return background.status === 'granted';
}

export async function startBackgroundTracking(): Promise<void> {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (hasStarted) return;

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: TRACKING_CONFIG.timeIntervalMs,
    distanceInterval: TRACKING_CONFIG.distanceIntervalM,
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: true,
    activityType: Location.ActivityType.Other,
    foregroundService: {
      notificationTitle: 'Location Wrapped',
      notificationBody: 'Quietly recording the places that make up your story.',
      notificationColor: '#7C5CFF',
    },
  });
}

export async function stopBackgroundTracking(): Promise<void> {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!hasStarted) return;
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
}

export async function captureForegroundSample(): Promise<Location.LocationObject | null> {
  const permission = await Location.getForegroundPermissionsAsync();
  if (permission.status !== 'granted') return null;

  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch {
    return null;
  }
}
