import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PlaceCard } from '@/components/PlaceCard';
import { EmptyState } from '@/components/EmptyState';
import { useAppData } from '@/hooks/useAppData';
import { colors, spacing, typography } from '@/constants/theme';

export default function MapScreenWeb() {
  const { places } = useAppData();

  return (
    <Screen>
      <SectionHeader
        title="Map"
        subtitle="Interactive maps are available in the iOS and Android builds. Web preview lists detected places."
      />
      <PrimaryButton label="Visit History" variant="secondary" onPress={() => router.push('/history')} />
      {places.length === 0 ? (
        <EmptyState
          icon="navigate-outline"
          title="Your journey starts here"
          message="Enable Demo Data in Profile to preview places on web."
        />
      ) : (
        <View style={styles.list}>
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </View>
      )}
      <Text style={styles.note}>
        Install the native app for the full map experience with markers, visits, and bottom sheets.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  note: {
    color: colors.textMuted,
    lineHeight: 22,
  },
});
