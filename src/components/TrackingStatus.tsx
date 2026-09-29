import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants/theme';

type Props = {
  active: boolean;
  detail?: string;
};

export function TrackingStatus({ active, detail }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: active ? colors.success : colors.warning }]} />
      <View style={styles.copy}>
        <Text style={styles.title}>{active ? 'Tracking Active' : 'Tracking Paused'}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radii.pill,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    fontSize: typography.body,
  },
  detail: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
});
