import { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { MapVisual } from '@/components/MapVisual';
import { PermissionCard } from '@/components/PermissionCard';
import { useAppData } from '@/hooks/useAppData';
import {
  requestBackgroundPermission,
  requestForegroundPermission,
  startBackgroundTracking,
} from '@/services/trackingService';
import { colors, radii, spacing, typography } from '@/constants/theme';

const STEPS = ['welcome', 'tracking', 'privacy', 'permissions'] as const;

export default function OnboardingScreen() {
  const { completeOnboarding, refreshPermissions, refresh } = useAppData();
  const [stepIndex, setStepIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const step = STEPS[stepIndex];

  async function handleContinue() {
    if (step === 'permissions') {
      const foreground = await requestForegroundPermission();
      if (!foreground) {
        setMessage('Foreground location access is required to detect visits.');
        return;
      }

      const background = await requestBackgroundPermission();
      await refreshPermissions();
      if (!background) {
        setMessage(
          'Background access was not granted. Location Wrapped will still track while the app is open.',
        );
      } else {
        try {
          await startBackgroundTracking();
        } catch (error) {
          console.warn(error);
        }
      }

      await completeOnboarding();
      await refresh();
      router.replace('/(tabs)/wrapped');
      return;
    }

    setMessage(null);
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.progressRow}>
          {STEPS.map((item, index) => (
            <View
              key={item}
              style={[styles.progressDot, index <= stepIndex && styles.progressDotActive]}
            />
          ))}
        </View>

        {step === 'welcome' ? (
          <>
            <MapVisual size={220} />
            <Text style={styles.title}>Welcome to Location Wrapped</Text>
            <Text style={styles.subtitle}>See your year through the places you went.</Text>
          </>
        ) : null}

        {step === 'tracking' ? (
          <>
            <Text style={styles.title}>Track the places that matter</Text>
            <Text style={styles.subtitle}>
              Location Wrapped quietly records the places you visit so it can build your personal
              recap.
            </Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Smart, battery-friendly tracking</Text>
              <Text style={styles.cardCopy}>
                We use sensible time and distance thresholds instead of recording GPS every second.
              </Text>
            </View>
          </>
        ) : null}

        {step === 'privacy' ? (
          <>
            <Text style={styles.title}>Your location history stays on your device.</Text>
            <Text style={styles.subtitle}>
              No cloud upload. No ads. No account required. You control pause, delete, export, and
              reset at any time.
            </Text>
            <PermissionCard
              title="Privacy first"
              message="Raw location history is stored locally in SQLite on your phone and is never sent to an external server in this version."
            />
          </>
        ) : null}

        {step === 'permissions' ? (
          <>
            <Text style={styles.title}>Enable location access</Text>
            <Text style={styles.subtitle}>
              Foreground access lets Location Wrapped detect visits while you use the app. Always /
              background access keeps your story complete when the app is closed.
            </Text>
            <PermissionCard
              title="What we request"
              message="While Using: detect visits during active use. Always / Background: continue visit detection when the app is not open. You can change this later in Settings."
            />
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {Platform.OS === 'ios' ? (
              <PrimaryButton
                label="Open iOS Settings"
                variant="ghost"
                onPress={() => Linking.openSettings()}
              />
            ) : null}
          </>
        ) : null}

        <View style={styles.footer}>
          <PrimaryButton
            label={step === 'permissions' ? 'Allow & Start Tracking' : 'Continue'}
            onPress={handleContinue}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.accent,
  },
  title: {
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    lineHeight: 46,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.subtitle,
    lineHeight: 28,
    fontFamily: 'Outfit_400Regular',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: typography.body,
  },
  cardCopy: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  message: {
    color: colors.warning,
    lineHeight: 22,
  },
  footer: {
    marginTop: 'auto',
  },
});
