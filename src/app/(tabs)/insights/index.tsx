import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StatCard } from '@/components/StatCard';
import { PlaceCard } from '@/components/PlaceCard';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { MonthlyChart } from '@/components/MonthlyChart';
import { EmptyState } from '@/components/EmptyState';
import { useAppData } from '@/hooks/useAppData';
import { formatMiles, formatNumber } from '@/utils/format';
import { colors, radii, spacing, typography } from '@/constants/theme';

export default function InsightsScreen() {
  const { wrappedStats, places } = useAppData();

  if (!wrappedStats.hasEnoughData && places.length === 0) {
    return (
      <Screen>
        <SectionHeader title="Insights" subtitle="Your movement patterns, distilled." />
        <EmptyState
          icon="analytics-outline"
          title="Insights are on the way"
          message="Once Location Wrapped detects visits, this screen will highlight your top places, categories, and monthly rhythm."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionHeader title="Insights" subtitle="Your movement patterns, distilled." />

      <View style={styles.statsGrid}>
        <StatCard label="Places Visited" value={formatNumber(wrappedStats.placesVisited)} />
        <StatCard label="Distance Traveled" value={`${formatMiles(wrappedStats.distanceMiles)} mi`} />
        <StatCard label="Total Visits" value={formatNumber(wrappedStats.totalVisits)} />
        <StatCard label="Cities Visited" value={formatNumber(wrappedStats.citiesVisited.length)} />
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Top Places</Text>
        {wrappedStats.topPlaces.map((place, index) => (
          <PlaceCard key={place.id} place={place} rank={index + 1} />
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Location Categories</Text>
        <CategoryBreakdown items={wrappedStats.categoryBreakdown} />
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Monthly Activity</Text>
        <MonthlyChart data={wrappedStats.monthlyActivity} />
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Time Spent by Category</Text>
        <CategoryBreakdown items={wrappedStats.categoryBreakdown} />
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>New vs Repeat Places</Text>
        <View style={styles.compareRow}>
          <CompareCard label="Unique" value={wrappedStats.uniqueLocations} />
          <CompareCard label="New" value={wrappedStats.newLocations} />
          <CompareCard label="Repeat" value={wrappedStats.repeatLocations} />
        </View>
      </View>
    </Screen>
  );
}

function CompareCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.compareCard}>
      <Text style={styles.compareValue}>{formatNumber(value)}</Text>
      <Text style={styles.compareLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  block: {
    gap: spacing.sm,
  },
  blockTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '800',
  },
  compareRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  compareCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  compareValue: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '800',
  },
  compareLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
});
