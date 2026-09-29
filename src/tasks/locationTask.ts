import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { openDatabaseAsync } from 'expo-sqlite';
import { LOCATION_TASK_NAME, TRACKING_CONFIG } from '@/constants/tracking';
import { insertLocationPoints } from '@/storage/database';
import type { LocationPoint } from '@/types';
import { createId } from '@/utils/id';
import { isValidReading } from '@/utils/geo';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.warn('Background location task error', error);
    return;
  }

  const locations = (data as { locations?: Location.LocationObject[] })?.locations ?? [];
  if (locations.length === 0) return;

  const points: LocationPoint[] = [];

  for (const location of locations) {
    const accuracy = location.coords.accuracy ?? null;
    const speed = location.coords.speed ?? null;

    if (
      !isValidReading(
        accuracy,
        speed,
        TRACKING_CONFIG.maxAccuracyM,
        TRACKING_CONFIG.maxSpeedMps,
      )
    ) {
      continue;
    }

    points.push({
      id: createId('point'),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
      accuracy,
      altitude: location.coords.altitude ?? null,
      speed,
      isDemo: false,
    });
  }

  if (points.length > 0) {
    const db = await openDatabaseAsync('location-wrapped.db');
    await insertLocationPoints(db, points);
  }
});
