import type { SQLiteDatabase } from 'expo-sqlite';
import { generateDemoDataset } from '@/data/demoDataset';
import {
  clearDemoData,
  getSettings,
  insertLocationPoints,
  replaceVisitsAndPlaces,
  setSettings,
} from '@/storage/database';

export async function enableDemoMode(db: SQLiteDatabase): Promise<void> {
  const settings = await getSettings(db);
  await clearDemoData(db);
  const dataset = generateDemoDataset();

  await insertLocationPoints(db, dataset.points);
  await replaceVisitsAndPlaces(db, dataset.visits, dataset.places, true);
  await setSettings(db, { ...settings, demoModeEnabled: true });
}

export async function disableDemoMode(db: SQLiteDatabase): Promise<void> {
  const settings = await getSettings(db);
  await clearDemoData(db);
  await setSettings(db, { ...settings, demoModeEnabled: false });
}
