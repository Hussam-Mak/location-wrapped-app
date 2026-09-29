import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CATEGORY_ORDER } from '@/constants/categories';
import { BottomSheet } from '@/components/BottomSheet';
import { EmptyState } from '@/components/EmptyState';
import { useAppData } from '@/hooks/useAppData';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants/categories';
import { formatHours } from '@/utils/format';
import { colors, radii, spacing, typography } from '@/constants/theme';
import type { Place } from '@/types';

export default function MapScreen() {
  const { places, visits, permissions, renamePlace, setPlaceCategory } = useAppData();
  const [selected, setSelected] = useState<Place | null>(null);
  const [draftName, setDraftName] = useState('');

  const region = useMemo(() => {
    if (places.length === 0) {
      return {
        latitude: 30.627,
        longitude: -96.334,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }

    const latitudes = places.map((place) => place.latitude);
    const longitudes = places.map((place) => place.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: Math.max(0.04, (maxLat - minLat) * 1.8),
      longitudeDelta: Math.max(0.04, (maxLon - minLon) * 1.8),
    };
  }, [places]);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.header}>
        <SectionHeader title="Map" subtitle="Meaningful places and visits, not every GPS blip." />
        <PrimaryButton
          label="Visit History"
          variant="secondary"
          onPress={() => router.push('/history')}
          style={styles.historyButton}
        />
      </View>

      {permissions.foreground !== 'granted' ? (
        <PermissionHint />
      ) : null}

      {places.length === 0 ? (
        <EmptyState
          icon="navigate-outline"
          title="Your journey starts here"
          message="Once visits are detected, your map will highlight the places that shaped your year."
        />
      ) : (
        <View style={styles.mapWrap}>
          <MapView
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_DEFAULT}
            initialRegion={region}
            showsUserLocation={permissions.foreground === 'granted'}
            showsMyLocationButton={Platform.OS === 'android'}
          >
            {places.map((place) => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                title={place.name ?? 'Detected place'}
                pinColor={CATEGORY_COLORS[place.category]}
                onPress={() => {
                  setSelected(place);
                  setDraftName(place.name ?? '');
                }}
              />
            ))}
            {visits.slice(-12).map((visit) => (
              <Circle
                key={visit.id}
                center={{ latitude: visit.latitude, longitude: visit.longitude }}
                radius={80}
                strokeWidth={1}
                strokeColor={`${CATEGORY_COLORS[visit.category]}88`}
                fillColor={`${CATEGORY_COLORS[visit.category]}22`}
              />
            ))}
          </MapView>
        </View>
      )}

      <BottomSheet
        visible={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Detected place'}
      >
        {selected ? (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetMeta}>
              {selected.visitCount} visits · {formatHours(selected.totalTimeMs)}
            </Text>
            <Text style={styles.sheetMeta}>
              Last visited {new Date(selected.lastVisited).toLocaleDateString()}
            </Text>
            <View style={styles.chip}>
              <Text style={[styles.chipText, { color: CATEGORY_COLORS[selected.category] }]}>
                {CATEGORY_LABELS[selected.category]}
              </Text>
            </View>
            <Text style={styles.renameLabel}>Rename place</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Home, Gym, Coffee Shop..."
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
            />
            <PrimaryButton
              label="Save name"
              variant="secondary"
              onPress={async () => {
                if (!selected || !draftName.trim()) return;
                await renamePlace(selected.id, draftName.trim());
                setSelected(null);
              }}
            />
            <View style={styles.categoryRow}>
              {CATEGORY_ORDER.slice(0, 5).map((category) => (
                <PrimaryButton
                  key={category}
                  label={CATEGORY_LABELS[category]}
                  variant="ghost"
                  onPress={async () => {
                    if (!selected) return;
                    if (draftName.trim()) await renamePlace(selected.id, draftName.trim());
                    await setPlaceCategory(selected.id, category);
                    setSelected(null);
                  }}
                />
              ))}
            </View>
          </View>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

function PermissionHint() {
  return (
    <View style={styles.permission}>
      <Text style={styles.permissionText}>
        Location permission is needed to show your current position on the map.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  historyButton: {
    alignSelf: 'flex-start',
  },
  mapWrap: {
    flex: 1,
    minHeight: 420,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  permission: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permissionText: {
    color: colors.textMuted,
  },
  sheetContent: {
    gap: spacing.sm,
  },
  sheetMeta: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontWeight: '700',
  },
  renameLabel: {
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
