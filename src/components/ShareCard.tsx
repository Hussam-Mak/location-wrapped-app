import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { WrappedStats } from '@/types';
import { formatMiles, formatNumber } from '@/utils/format';
import { CATEGORY_LABELS } from '@/constants/categories';
import { gradients, typography } from '@/constants/theme';

type Props = {
  stats: WrappedStats;
};

export const ShareCard = forwardRef<View, Props>(function ShareCard({ stats }, ref) {
  const topPlace = stats.topPlace?.name ?? 'Your favorite spot';
  const favoriteCategory = stats.favoriteCategory
    ? CATEGORY_LABELS[stats.favoriteCategory]
    : 'Mixed';

  return (
    <View ref={ref} collapsable={false} style={styles.outer}>
      <LinearGradient colors={gradients.wrappedFinal} style={styles.card}>
        <Text style={styles.brand}>Location Wrapped</Text>
        <Text style={styles.year}>{stats.year}</Text>
        <View style={styles.metrics}>
          <Metric label="Places visited" value={formatNumber(stats.placesVisited)} />
          <Metric label="Miles traveled" value={formatMiles(stats.distanceMiles)} />
          <Metric label="Top location" value={topPlace} />
          <Metric label="Cities visited" value={formatNumber(stats.citiesVisited.length)} />
          <Metric label="Favorite category" value={favoriteCategory} />
        </View>
        <Text style={styles.footer}>Your location history stays on your device.</Text>
      </LinearGradient>
    </View>
  );
});

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 360,
    aspectRatio: 9 / 16,
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 28,
    padding: 28,
    justifyContent: 'space-between',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  year: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900',
    marginTop: 8,
  },
  metrics: {
    gap: 18,
  },
  metric: {
    gap: 4,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: typography.caption,
    textAlign: 'center',
  },
});
