import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Place } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants/categories';
import { formatHours } from '@/utils/format';
import { colors, radii, spacing, typography } from '@/constants/theme';

type Props = {
  place: Place;
  rank?: number;
  onPress?: () => void;
};

export function PlaceCard({ place, rank, onPress }: Props) {
  const label = place.name ?? 'Unnamed place';
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        {rank ? <Text style={styles.rank}>{rank}</Text> : null}
        <View style={styles.copy}>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.meta}>
            {place.visitCount} visits · {formatHours(place.totalTimeMs)}
          </Text>
        </View>
        <View
          style={[styles.chip, { backgroundColor: `${CATEGORY_COLORS[place.category]}33` }]}
        >
          <Text style={[styles.chipText, { color: CATEGORY_COLORS[place.category] }]}>
            {CATEGORY_LABELS[place.category]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rank: {
    color: colors.accent,
    fontSize: typography.title,
    fontWeight: '800',
    width: 28,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
});
