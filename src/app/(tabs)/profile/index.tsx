import { Alert, Linking, Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { TrackingStatus } from '@/components/TrackingStatus';
import { PermissionCard } from '@/components/PermissionCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAppData } from '@/hooks/useAppData';
import {
  requestBackgroundPermission,
  requestForegroundPermission,
  startBackgroundTracking,
  stopBackgroundTracking,
} from '@/services/trackingService';
import { colors, radii, spacing, typography } from '@/constants/theme';

export default function ProfileScreen() {
  const {
    settings,
    permissions,
    counts,
    setTrackingPaused,
    toggleDemoMode,
    deleteHistory,
    resetApp,
    exportData,
    importData,
    refreshPermissions,
    refresh,
  } = useAppData();

  const trackingActive =
    !settings.trackingPaused &&
    permissions.foreground === 'granted' &&
    permissions.servicesEnabled;

  async function handlePauseToggle(paused: boolean) {
    await setTrackingPaused(paused);
    if (paused) await stopBackgroundTracking();
    else if (permissions.background === 'granted') await startBackgroundTracking();
    await refresh();
  }

  function confirmDeleteHistory() {
    Alert.alert(
      'Delete location history?',
      'This removes real GPS points, visits, and detected places from this device. Demo data is not removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHistory(),
        },
      ],
    );
  }

  function confirmReset() {
    Alert.alert(
      'Reset application data?',
      'This clears settings, history, visits, places, and demo data from the device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetApp(),
        },
      ],
    );
  }

  return (
    <Screen>
      <SectionHeader title="Profile" subtitle="Tracking, privacy, and your local data." />

      <TrackingStatus
        active={trackingActive}
        detail={
          permissions.background === 'granted'
            ? 'Foreground and background location enabled'
            : permissions.foreground === 'granted'
              ? 'Foreground location enabled'
              : 'Location permission required'
        }
      />

      <View style={styles.rowCard}>
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>Pause tracking</Text>
          <Text style={styles.rowMeta}>Stop collecting new location samples</Text>
        </View>
        <Switch
          value={settings.trackingPaused}
          onValueChange={handlePauseToggle}
          trackColor={{ true: colors.accent, false: colors.surfaceElevated }}
        />
      </View>

      <View style={styles.rowCard}>
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>Demo Data</Text>
          <Text style={styles.rowMeta}>Preview the full app with realistic sample history</Text>
        </View>
        <Switch
          value={settings.demoModeEnabled}
          onValueChange={(value) => toggleDemoMode(value)}
          trackColor={{ true: colors.accentAlt, false: colors.surfaceElevated }}
        />
      </View>

      <PermissionCard
        title="Location permissions"
        message={`Foreground: ${permissions.foreground}. Background: ${permissions.background}. Location services: ${permissions.servicesEnabled ? 'on' : 'off'}.`}
        actionLabel="Request permissions"
        onAction={async () => {
          await requestForegroundPermission();
          await requestBackgroundPermission();
          await refreshPermissions();
          if (!settings.trackingPaused) {
            try {
              await startBackgroundTracking();
            } catch (error) {
              console.warn(error);
            }
          }
          await refresh();
        }}
      />

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Stored on this device</Text>
        <Text style={styles.statsLine}>{counts.points} GPS points</Text>
        <Text style={styles.statsLine}>{counts.visits} detected visits</Text>
        <Text style={styles.statsLine}>{counts.places} places</Text>
        <Text style={styles.privacy}>Your location history stays on your device.</Text>
      </View>

      <PrimaryButton label="Export backup" variant="secondary" onPress={() => exportData()} />
      <PrimaryButton label="Import backup" variant="secondary" onPress={() => importData()} />
      <PrimaryButton label="Delete location history" variant="secondary" onPress={confirmDeleteHistory} />
      <PrimaryButton label="Reset application data" variant="ghost" onPress={confirmReset} />

      {Platform.OS === 'ios' ? (
        <PrimaryButton label="Open iOS Settings" variant="ghost" onPress={() => Linking.openSettings()} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: typography.body,
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  statsCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    color: colors.text,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  statsLine: {
    color: colors.textMuted,
  },
  privacy: {
    color: colors.success,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
});
