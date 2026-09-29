import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { BackupPayload } from '@/types';
import { exportAllData, importBackup } from '@/storage/database';

export async function exportBackup(db: SQLiteDatabase): Promise<string> {
  const data = await exportAllData(db);
  const payload: BackupPayload = {
    version: 1,
    exportedAt: Date.now(),
    ...data,
  };

  const fileName = `location-wrapped-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(JSON.stringify(payload, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export Location Wrapped backup',
    });
  }

  return file.uri;
}

export async function importBackupFromPicker(db: SQLiteDatabase): Promise<boolean> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) return false;

  const asset = result.assets[0];
  const file = new File(asset.uri);
  const contents = await file.text();
  const payload = JSON.parse(contents) as BackupPayload;

  if (!payload || payload.version !== 1) {
    throw new Error('Unsupported backup file.');
  }

  await importBackup(db, {
    settings: payload.settings,
    points: payload.points,
    visits: payload.visits,
    places: payload.places,
  });

  return true;
}
