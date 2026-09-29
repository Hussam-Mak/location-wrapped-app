import type { SQLiteDatabase } from 'expo-sqlite';
import type { AppSettings, LocationPoint, Place, Visit } from '@/types';

const DEFAULT_SETTINGS: AppSettings = {
  onboardingComplete: false,
  trackingPaused: false,
  demoModeEnabled: false,
  lastProcessedAt: null,
};

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS location_points (
      id TEXT PRIMARY KEY NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      accuracy REAL,
      altitude REAL,
      speed REAL,
      is_demo INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY NOT NULL,
      place_id TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      arrival_time INTEGER NOT NULL,
      departure_time INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      point_count INTEGER NOT NULL,
      place_name TEXT,
      category TEXT NOT NULL,
      is_demo INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      name TEXT,
      address TEXT,
      category TEXT NOT NULL,
      visit_count INTEGER NOT NULL,
      total_time_ms INTEGER NOT NULL,
      first_visited INTEGER NOT NULL,
      last_visited INTEGER NOT NULL,
      is_demo INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_points_timestamp ON location_points(timestamp);
    CREATE INDEX IF NOT EXISTS idx_visits_arrival ON visits(arrival_time);
    CREATE INDEX IF NOT EXISTS idx_places_last ON places(last_visited);
  `);

  const existing = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    ['app_settings'],
  );

  if (!existing) {
    await setSettings(db, DEFAULT_SETTINGS);
  }
}

function mapPoint(row: Record<string, unknown>): LocationPoint {
  return {
    id: String(row.id),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    timestamp: Number(row.timestamp),
    accuracy: row.accuracy == null ? null : Number(row.accuracy),
    altitude: row.altitude == null ? null : Number(row.altitude),
    speed: row.speed == null ? null : Number(row.speed),
    isDemo: Boolean(row.is_demo),
  };
}

function mapVisit(row: Record<string, unknown>): Visit {
  return {
    id: String(row.id),
    placeId: row.place_id ? String(row.place_id) : null,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    arrivalTime: Number(row.arrival_time),
    departureTime: Number(row.departure_time),
    durationMs: Number(row.duration_ms),
    pointCount: Number(row.point_count),
    placeName: row.place_name ? String(row.place_name) : null,
    category: row.category as Visit['category'],
    isDemo: Boolean(row.is_demo),
  };
}

function mapPlace(row: Record<string, unknown>): Place {
  return {
    id: String(row.id),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    name: row.name ? String(row.name) : null,
    address: row.address ? String(row.address) : null,
    category: row.category as Place['category'],
    visitCount: Number(row.visit_count),
    totalTimeMs: Number(row.total_time_ms),
    firstVisited: Number(row.first_visited),
    lastVisited: Number(row.last_visited),
    isDemo: Boolean(row.is_demo),
  };
}

export async function getSettings(db: SQLiteDatabase): Promise<AppSettings> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    ['app_settings'],
  );
  if (!row) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(JSON.parse(row.value) as AppSettings) };
}

export async function setSettings(db: SQLiteDatabase, settings: AppSettings): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    ['app_settings', JSON.stringify(settings)],
  );
}

export async function insertLocationPoints(
  db: SQLiteDatabase,
  points: LocationPoint[],
): Promise<void> {
  if (points.length === 0) return;

  await db.withTransactionAsync(async () => {
    for (const point of points) {
      await db.runAsync(
        `INSERT OR IGNORE INTO location_points
        (id, latitude, longitude, timestamp, accuracy, altitude, speed, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          point.id,
          point.latitude,
          point.longitude,
          point.timestamp,
          point.accuracy,
          point.altitude,
          point.speed,
          point.isDemo ? 1 : 0,
        ],
      );
    }
  });
}

export async function replaceVisitsAndPlaces(
  db: SQLiteDatabase,
  visits: Visit[],
  places: Place[],
  demoOnly: boolean,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    if (demoOnly) {
      await db.runAsync('DELETE FROM visits WHERE is_demo = 1');
      await db.runAsync('DELETE FROM places WHERE is_demo = 1');
    } else {
      await db.runAsync('DELETE FROM visits WHERE is_demo = 0');
      await db.runAsync('DELETE FROM places WHERE is_demo = 0');
    }

    for (const visit of visits) {
      await db.runAsync(
        `INSERT OR REPLACE INTO visits
        (id, place_id, latitude, longitude, arrival_time, departure_time, duration_ms, point_count, place_name, category, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          visit.id,
          visit.placeId,
          visit.latitude,
          visit.longitude,
          visit.arrivalTime,
          visit.departureTime,
          visit.durationMs,
          visit.pointCount,
          visit.placeName,
          visit.category,
          visit.isDemo ? 1 : 0,
        ],
      );
    }

    for (const place of places) {
      await db.runAsync(
        `INSERT OR REPLACE INTO places
        (id, latitude, longitude, name, address, category, visit_count, total_time_ms, first_visited, last_visited, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          place.id,
          place.latitude,
          place.longitude,
          place.name,
          place.address,
          place.category,
          place.visitCount,
          place.totalTimeMs,
          place.firstVisited,
          place.lastVisited,
          place.isDemo ? 1 : 0,
        ],
      );
    }
  });
}

export async function getLocationPoints(
  db: SQLiteDatabase,
  includeDemo: boolean,
): Promise<LocationPoint[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    includeDemo
      ? 'SELECT * FROM location_points ORDER BY timestamp ASC'
      : 'SELECT * FROM location_points WHERE is_demo = 0 ORDER BY timestamp ASC',
  );
  return rows.map(mapPoint);
}

export async function getVisits(db: SQLiteDatabase, includeDemo: boolean): Promise<Visit[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    includeDemo
      ? 'SELECT * FROM visits ORDER BY arrival_time ASC'
      : 'SELECT * FROM visits WHERE is_demo = 0 ORDER BY arrival_time ASC',
  );
  return rows.map(mapVisit);
}

export async function getPlaces(db: SQLiteDatabase, includeDemo: boolean): Promise<Place[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    includeDemo
      ? 'SELECT * FROM places ORDER BY total_time_ms DESC'
      : 'SELECT * FROM places WHERE is_demo = 0 ORDER BY total_time_ms DESC',
  );
  return rows.map(mapPlace);
}

export async function getCounts(
  db: SQLiteDatabase,
  includeDemo: boolean,
): Promise<{ points: number; visits: number; places: number }> {
  const demoFilter = includeDemo ? '' : ' WHERE is_demo = 0';
  const [pointsRow, visitsRow, placesRow] = await Promise.all([
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM location_points${demoFilter}`,
    ),
    db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM visits${demoFilter}`),
    db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM places${demoFilter}`),
  ]);

  return {
    points: pointsRow?.count ?? 0,
    visits: visitsRow?.count ?? 0,
    places: placesRow?.count ?? 0,
  };
}

export async function clearDemoData(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM location_points WHERE is_demo = 1');
    await db.runAsync('DELETE FROM visits WHERE is_demo = 1');
    await db.runAsync('DELETE FROM places WHERE is_demo = 1');
  });
}

export async function clearRealLocationHistory(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM location_points WHERE is_demo = 0');
    await db.runAsync('DELETE FROM visits WHERE is_demo = 0');
    await db.runAsync('DELETE FROM places WHERE is_demo = 0');
  });
}

export async function resetAllData(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM location_points');
    await db.runAsync('DELETE FROM visits');
    await db.runAsync('DELETE FROM places');
  });
  await setSettings(db, DEFAULT_SETTINGS);
}

export async function updatePlaceName(
  db: SQLiteDatabase,
  placeId: string,
  name: string,
): Promise<void> {
  await db.runAsync('UPDATE places SET name = ? WHERE id = ?', [name, placeId]);
  await db.runAsync('UPDATE visits SET place_name = ? WHERE place_id = ?', [name, placeId]);
}

export async function updatePlaceCategory(
  db: SQLiteDatabase,
  placeId: string,
  category: Place['category'],
): Promise<void> {
  await db.runAsync('UPDATE places SET category = ? WHERE id = ?', [category, placeId]);
  await db.runAsync('UPDATE visits SET category = ? WHERE place_id = ?', [category, placeId]);
}

export async function exportAllData(db: SQLiteDatabase) {
  const [settings, points, visits, places] = await Promise.all([
    getSettings(db),
    getLocationPoints(db, true),
    getVisits(db, true),
    getPlaces(db, true),
  ]);
  return { settings, points, visits, places };
}

export async function importBackup(
  db: SQLiteDatabase,
  payload: {
    settings: AppSettings;
    points: LocationPoint[];
    visits: Visit[];
    places: Place[];
  },
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM location_points');
    await db.runAsync('DELETE FROM visits');
    await db.runAsync('DELETE FROM places');
  });

  await insertLocationPoints(db, payload.points);
  await replaceVisitsAndPlaces(db, payload.visits, payload.places, false);
  await setSettings(db, payload.settings);
}
