import type { SQLiteDatabase } from 'expo-sqlite';
import {
  getLocationPoints,
  getSettings,
  replaceVisitsAndPlaces,
  setSettings,
} from '@/storage/database';
import { detectVisitsFromPoints, clusterPlacesFromVisits, attachVisitsToPlaces } from '@/utils/visits';

export async function reprocessLocationData(db: SQLiteDatabase): Promise<void> {
  const settings = await getSettings(db);
  const realPoints = await getLocationPoints(db, false);

  if (realPoints.length === 0) {
    return;
  }

  const visits = detectVisitsFromPoints(realPoints);
  const places = clusterPlacesFromVisits(visits);
  const linkedVisits = attachVisitsToPlaces(visits, places);

  await replaceVisitsAndPlaces(db, linkedVisits, places, false);
  await setSettings(db, { ...settings, lastProcessedAt: Date.now() });
}
