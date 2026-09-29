import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useAppData } from '@/hooks/useAppData';
import {
  captureForegroundSample,
  startBackgroundTracking,
  stopBackgroundTracking,
} from '@/services/trackingService';
import { insertLocationPoints } from '@/storage/database';
import { createId } from '@/utils/id';
import { reprocessLocationData } from '@/services/processingService';

export function useTrackingLifecycle(): void {
  const db = useSQLiteContext();
  const { settings, permissions, refresh } = useAppData();

  useEffect(() => {
    let cancelled = false;

    async function syncTracking() {
      const canTrack =
        !settings.trackingPaused &&
        settings.onboardingComplete &&
        permissions.foreground === 'granted';

      if (!canTrack) {
        await stopBackgroundTracking();
        return;
      }

      try {
        await startBackgroundTracking();
      } catch (error) {
        console.warn('Unable to start background tracking', error);
      }

      if (permissions.background !== 'granted') {
        const sample = await captureForegroundSample();
        if (sample && !cancelled) {
          await insertLocationPoints(db, [
            {
              id: createId('point'),
              latitude: sample.coords.latitude,
              longitude: sample.coords.longitude,
              timestamp: sample.timestamp,
              accuracy: sample.coords.accuracy ?? null,
              altitude: sample.coords.altitude ?? null,
              speed: sample.coords.speed ?? null,
              isDemo: false,
            },
          ]);
          await reprocessLocationData(db);
          await refresh();
        }
      }
    }

    syncTracking();
    return () => {
      cancelled = true;
    };
  }, [
    db,
    permissions.background,
    permissions.foreground,
    refresh,
    settings.onboardingComplete,
    settings.trackingPaused,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);
}
