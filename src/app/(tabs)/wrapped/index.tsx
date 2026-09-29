import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StatCard } from '@/components/StatCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { useAppData } from '@/hooks/useAppData';
import { formatMiles, formatNumber } from '@/utils/format';
import { colors, radii, spacing, typography } from '@/constants/theme';

export default function WrappedHomeScreen() {
  const { wrappedStats, settings, counts } = useAppData();

  return (
    <Screen>
      <SectionHeader
        title="Location Wrapped"
        subtitle="Track → Explore → Remember → Wrapped → Share"
      />

      {settings.demoModeEnabled ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoTitle}>Demo Data Active</Text>
          <Text style={styles.demoCopy}>
            You are previewing a realistic sample journey. Demo data stays separate from your real
            location history.
          </Text>
        </View>
      ) : null}

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Your recap status</Text>
        <Text style={styles.heroTitle}>
          {wrappedStats.hasEnoughData
            ? 'Your Wrapped is ready'
            : 'Your Wrapped is being created'}
        </Text>
        <Text style={styles.heroCopy}>
          {wrappedStats.hasEnoughData
            ? `${wrappedStats.year} was quite a journey. Tap below to replay your story.`
            : 'Keep exploring. Your Wrapped is taking shape as visits accumulate.'}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Days tracked" value={formatNumber(wrappedStats.daysTracked)} />
        <StatCard
          label="Places discovered"
          value={formatNumber(wrappedStats.placesVisited)}
          accent={colors.accentAlt}
        />
        <StatCard label="Visits recorded" value={formatNumber(wrappedStats.totalVisits)} />
        <StatCard
          label="Distance traveled"
          value={`${formatMiles(wrappedStats.distanceMiles)} mi`}
          accent={colors.success}
        />
      </View>

      {wrappedStats.hasEnoughData ? (
        <PrimaryButton label="View My Wrapped" onPress={() => router.push('/wrapped/story')} />
      ) : (
        <EmptyState
          icon="sparkles-outline"
          title="Not enough story yet"
          message="Location Wrapped needs a few days of visits before the full story unlocks. Turn on Demo Data in Profile to preview the complete experience now."
        />
      )}

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>On-device only</Text>
        <Text style={styles.footerCopy}>
          Stored locally: {formatNumber(counts.points)} GPS points ·{' '}
          {formatNumber(counts.visits)} visits · {formatNumber(counts.places)} places
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  demoBanner: {
    backgroundColor: 'rgba(124,92,255,0.15)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,0.35)',
    gap: spacing.xs,
  },
  demoTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  demoCopy: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  heroEyebrow: {
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
  },
  heroCopy: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  footerTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  footerCopy: {
    color: colors.textMuted,
    lineHeight: 22,
  },
});
