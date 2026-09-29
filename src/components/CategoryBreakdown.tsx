import { StyleSheet, Text, View } from 'react-native';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants/categories';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { PlaceCategory } from '@/types';

type Item = { category: PlaceCategory; hours: number; percent: number };

type Props = {
  items: Item[];
};

export function CategoryBreakdown({ items }: Props) {
  const visible = items.filter((item) => item.percent > 0).slice(0, 6);
  if (visible.length === 0) {
    return (
      <Text style={styles.empty}>Category insights will appear after more visits are detected.</Text>
    );
  }

  return (
    <View style={styles.container}>
      {visible.map((item) => (
        <View key={item.category} style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{CATEGORY_LABELS[item.category]}</Text>
            <Text style={styles.percent}>{Math.round(item.percent)}%</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.max(item.percent, 6)}%`,
                  backgroundColor: CATEGORY_COLORS[item.category],
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
  percent: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  track: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  empty: {
    color: colors.textMuted,
  },
});
