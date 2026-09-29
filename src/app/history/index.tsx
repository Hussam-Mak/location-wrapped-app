import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { VisitRow } from '@/components/VisitRow';
import { EmptyState } from '@/components/EmptyState';
import { useAppData } from '@/hooks/useAppData';
import { groupVisitsByDay } from '@/utils/stats';
import { colors, spacing, typography } from '@/constants/theme';

export default function HistoryScreen() {
  const { visits } = useAppData();
  const groups = groupVisitsByDay(visits);

  return (
    <Screen>
      {groups.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="Your journey starts here"
          message="Chronological visits will appear here once Location Wrapped detects meaningful stays."
        />
      ) : (
        groups.map((group) => (
          <View key={group.dayKey} style={styles.group}>
            <Text style={styles.day}>{group.label}</Text>
            {group.visits.map((visit) => (
              <VisitRow key={visit.id} visit={visit} />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  day: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
});
