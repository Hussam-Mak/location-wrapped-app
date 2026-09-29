import { StyleSheet, Text, View } from 'react-native';
import type { MonthlyStats } from '@/types';
import { colors, radii, spacing, typography } from '@/constants/theme';

type Props = {
  data: MonthlyStats[];
};

export function MonthlyChart({ data }: Props) {
  const visible = data.slice(-6);
  const max = Math.max(...visible.map((item) => item.visitCount), 1);

  if (visible.length === 0) {
    return <Text style={styles.empty}>Monthly activity will appear as visits accumulate.</Text>;
  }

  return (
    <View style={styles.container}>
      {visible.map((item) => (
        <View key={item.monthKey} style={styles.column}>
          <View style={styles.barTrack}>
            <View style={[styles.bar, { height: `${(item.visitCount / max) * 100}%` }]} />
          </View>
          <Text style={styles.label}>{item.label.split(' ')[0].slice(0, 3)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    height: 160,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: 4,
  },
  bar: {
    width: '100%',
    minHeight: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  empty: {
    color: colors.textMuted,
  },
});
