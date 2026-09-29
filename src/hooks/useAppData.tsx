import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { AppSettings, LocationPermissionState, Place, Visit, WrappedStats } from '@/types';
import {
  getCounts,
  getLocationPoints,
  getPlaces,
  getSettings,
  getVisits,
  setSettings,
} from '@/storage/database';
import { buildWrappedStats } from '@/utils/stats';
import { getPermissionState } from '@/services/trackingService';
import { reprocessLocationData } from '@/services/processingService';
import { enableDemoMode, disableDemoMode } from '@/services/demoService';
import { exportBackup, importBackupFromPicker } from '@/services/backupService';
import {
  clearRealLocationHistory,
  resetAllData,
  updatePlaceCategory,
  updatePlaceName,
} from '@/storage/database';

type AppDataContextValue = {
  loading: boolean;
  settings: AppSettings;
  permissions: LocationPermissionState;
  points: Awaited<ReturnType<typeof getLocationPoints>>;
  visits: Visit[];
  places: Place[];
  counts: { points: number; visits: number; places: number };
  wrappedStats: WrappedStats;
  refresh: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setTrackingPaused: (paused: boolean) => Promise<void>;
  toggleDemoMode: (enabled: boolean) => Promise<void>;
  deleteHistory: () => Promise<void>;
  resetApp: () => Promise<void>;
  exportData: () => Promise<void>;
  importData: () => Promise<void>;
  renamePlace: (placeId: string, name: string) => Promise<void>;
  setPlaceCategory: (placeId: string, category: Place['category']) => Promise<void>;
  refreshPermissions: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [settings, setSettingsState] = useState<AppSettings>({
    onboardingComplete: false,
    trackingPaused: false,
    demoModeEnabled: false,
    lastProcessedAt: null,
  });
  const [permissions, setPermissions] = useState<LocationPermissionState>({
    foreground: 'undetermined',
    background: 'undetermined',
    servicesEnabled: true,
  });
  const [points, setPoints] = useState<Awaited<ReturnType<typeof getLocationPoints>>>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [counts, setCounts] = useState({ points: 0, visits: 0, places: 0 });

  const refresh = useCallback(async () => {
    await reprocessLocationData(db);
    const nextSettings = await getSettings(db);
    const includeDemo = nextSettings.demoModeEnabled;
    const [nextPoints, nextVisits, nextPlaces, nextCounts, nextPermissions] =
      await Promise.all([
        getLocationPoints(db, includeDemo),
        getVisits(db, includeDemo),
        getPlaces(db, includeDemo),
        getCounts(db, includeDemo),
        getPermissionState(),
      ]);

    setSettingsState(nextSettings);
    setPoints(nextPoints);
    setVisits(nextVisits);
    setPlaces(nextPlaces);
    setCounts(nextCounts);
    setPermissions(nextPermissions);
  }, [db]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (mounted) await refresh();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refresh]);

  const wrappedStats = useMemo(
    () => buildWrappedStats(points, visits, places),
    [points, visits, places],
  );

  const completeOnboarding = useCallback(async () => {
    const next = { ...settings, onboardingComplete: true };
    await setSettings(db, next);
    setSettingsState(next);
  }, [db, settings]);

  const setTrackingPaused = useCallback(
    async (paused: boolean) => {
      const next = { ...settings, trackingPaused: paused };
      await setSettings(db, next);
      setSettingsState(next);
    },
    [db, settings],
  );

  const toggleDemoMode = useCallback(
    async (enabled: boolean) => {
      if (enabled) await enableDemoMode(db);
      else await disableDemoMode(db);
      await refresh();
    },
    [db, refresh],
  );

  const deleteHistory = useCallback(async () => {
    await clearRealLocationHistory(db);
    await refresh();
  }, [db, refresh]);

  const resetApp = useCallback(async () => {
    await resetAllData(db);
    await refresh();
  }, [db, refresh]);

  const exportData = useCallback(async () => {
    await exportBackup(db);
  }, [db]);

  const importData = useCallback(async () => {
    const imported = await importBackupFromPicker(db);
    if (imported) await refresh();
  }, [db, refresh]);

  const renamePlaceById = useCallback(
    async (placeId: string, name: string) => {
      await updatePlaceName(db, placeId, name);
      await refresh();
    },
    [db, refresh],
  );

  const setPlaceCategoryById = useCallback(
    async (placeId: string, category: Place['category']) => {
      await updatePlaceCategory(db, placeId, category);
      await refresh();
    },
    [db, refresh],
  );

  const refreshPermissions = useCallback(async () => {
    setPermissions(await getPermissionState());
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      loading,
      settings,
      permissions,
      points,
      visits,
      places,
      counts,
      wrappedStats,
      refresh,
      completeOnboarding,
      setTrackingPaused,
      toggleDemoMode,
      deleteHistory,
      resetApp,
      exportData,
      importData,
      renamePlace: renamePlaceById,
      setPlaceCategory: setPlaceCategoryById,
      refreshPermissions,
    }),
    [
      loading,
      settings,
      permissions,
      points,
      visits,
      places,
      counts,
      wrappedStats,
      refresh,
      completeOnboarding,
      setTrackingPaused,
      toggleDemoMode,
      deleteHistory,
      resetApp,
      exportData,
      importData,
      renamePlaceById,
      setPlaceCategoryById,
      refreshPermissions,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
