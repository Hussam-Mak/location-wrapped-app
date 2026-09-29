import { StyleSheet, Text, View } from 'react-native';
import type { Visit } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants/categories';
import { formatDuration, formatTime } from '@/utils/format';
import { colors, radii, spacing, typography } from '@/constants/theme';

type Props = {
  visit: Visit;
};

export function VisitRow({ visit }: Props) {
  const title = visit.placeName ?? 'Detected visit';
  return (
    <View style={styles.row}>
      <View style={styles.timeline}>
        <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[visit.category] }]} />
        <View style={styles.line} />
      </View>
      <View style={styles.content}>
        <Text style={styles.time}>{formatTime(visit.arrivalTime)}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>
          {formatTime(visit.arrivalTime)} – {formatTime(visit.departureTime)} ·{' '}
          {formatDuration(visit.durationMs)} · {CATEGORY_LABELS[visit.category]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeline: {
    alignItems: 'center',
    width: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    marginTop: 6,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.md,
    gap: 2,
  },
  time: {
    color: colors.textSubtle,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
