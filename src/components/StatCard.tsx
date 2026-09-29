import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  accent?: string;
};

export function StatCard({ label, value, accent = colors.accent }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  accent: {
    width: 28,
    height: 4,
    borderRadius: radii.pill,
  },
  value: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '800',
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
});
