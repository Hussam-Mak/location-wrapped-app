import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { WrappedProgress } from '@/components/WrappedProgress';
import { WrappedSlide } from '@/components/WrappedSlide';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { MonthlyChart } from '@/components/MonthlyChart';
import { ShareCard } from '@/components/ShareCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PlaceCard } from '@/components/PlaceCard';
import { MapVisual } from '@/components/MapVisual';
import { useAppData } from '@/hooks/useAppData';
import { gradients, spacing, typography } from '@/constants/theme';
import { formatHours, formatMiles, formatNumber, distanceComparison } from '@/utils/format';
import { CATEGORY_LABELS } from '@/constants/categories';

const { width, height } = Dimensions.get('window');

type SlideKey =
  | 'intro'
  | 'places'
  | 'distance'
  | 'top'
  | 'topFive'
  | 'categories'
  | 'month'
  | 'explore'
  | 'personality'
  | 'summary';

const SLIDES: SlideKey[] = [
  'intro',
  'places',
  'distance',
  'top',
  'topFive',
  'categories',
  'month',
  'explore',
  'personality',
  'summary',
];

export default function WrappedStoryScreen() {
  const { wrappedStats } = useAppData();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<SlideKey>>(null);
  const shareRef = useRef<ViewShotRef | null>(null);

  const topPlace = wrappedStats.topPlace;
  const topPercent =
    topPlace && wrappedStats.totalTrackedHours > 0
      ? Math.round(
          (topPlace.totalTimeMs / (wrappedStats.totalTrackedHours * 3600 * 1000)) * 100,
        )
      : 0;

  const renderItem: ListRenderItem<SlideKey> = ({ item }) => {
    const slide = (() => {
    switch (item) {
      case 'intro':
        return (
          <WrappedSlide
            colors={gradients.wrappedIntro}
            eyebrow="Location Wrapped"
            title={`Your Location Wrapped`}
            subtitle={`${wrappedStats.year} was quite a journey.`}
          >
            <MapVisual size={200} />
          </WrappedSlide>
        );
      case 'places':
        return (
          <WrappedSlide colors={gradients.wrappedPlaces} title="Places visited">
            <AnimatedCounter
              value={wrappedStats.placesVisited}
              style={styles.displayNumber}
            />
            <Text style={styles.slideBody}>That&apos;s how many places made up your year.</Text>
          </WrappedSlide>
        );
      case 'distance':
        return (
          <WrappedSlide colors={gradients.wrappedDistance} title="Distance traveled">
            <AnimatedCounter
              value={wrappedStats.distanceMiles}
              decimals={0}
              suffix=" miles"
              style={styles.displayNumber}
            />
            <Text style={styles.slideBody}>{distanceComparison(wrappedStats.distanceMiles)}</Text>
          </WrappedSlide>
        );
      case 'top':
        return (
          <WrappedSlide colors={gradients.wrappedTop} eyebrow="Your #1 place" title={topPlace?.name ?? 'Home'}>
            <Text style={styles.slideBody}>
              {formatNumber(topPlace?.visitCount ?? 0)} visits ·{' '}
              {formatHours(topPlace?.totalTimeMs ?? 0)} · {topPercent}% of tracked time
            </Text>
          </WrappedSlide>
        );
      case 'topFive':
        return (
          <WrappedSlide colors={gradients.wrappedExplore} title="Top five places">
            <View style={styles.listGap}>
              {wrappedStats.topPlaces.map((place, rank) => (
                <PlaceCard key={place.id} place={place} rank={rank + 1} />
              ))}
            </View>
          </WrappedSlide>
        );
      case 'categories':
        return (
          <WrappedSlide colors={gradients.wrappedCategories} title="Time breakdown">
            <CategoryBreakdown items={wrappedStats.categoryBreakdown} />
          </WrappedSlide>
        );
      case 'month':
        return (
          <WrappedSlide
            colors={gradients.wrappedMonth}
            title={
              wrappedStats.mostActiveMonth
                ? `${wrappedStats.mostActiveMonth.label.split(' ')[0]} was your busiest month`
                : 'Your busiest month'
            }
          >
            <MonthlyChart data={wrappedStats.monthlyActivity} />
          </WrappedSlide>
        );
      case 'explore':
        return (
          <WrappedSlide colors={gradients.wrappedExplore} title="Exploration">
            <MetricLine label="Unique locations" value={wrappedStats.uniqueLocations} />
            <MetricLine label="New locations" value={wrappedStats.newLocations} />
            <MetricLine label="Repeat locations" value={wrappedStats.repeatLocations} />
            <MetricLine label="Cities visited" value={wrappedStats.citiesVisited.length} />
          </WrappedSlide>
        );
      case 'personality':
        return (
          <WrappedSlide
            colors={gradients.wrappedPersonality}
            eyebrow="Movement personality"
            title={wrappedStats.personalityTitle}
            subtitle={wrappedStats.personalityDescription}
          />
        );
      case 'summary':
        return (
          <WrappedSlide colors={gradients.wrappedFinal} title={`Location Wrapped ${wrappedStats.year}`}>
            <View style={styles.summaryMetrics}>
              <Text style={styles.summaryLine}>
                {formatNumber(wrappedStats.placesVisited)} places ·{' '}
                {formatMiles(wrappedStats.distanceMiles)} miles
              </Text>
              <Text style={styles.summaryLine}>
                Top location: {topPlace?.name ?? '—'}
              </Text>
              <Text style={styles.summaryLine}>
                Cities: {formatNumber(wrappedStats.citiesVisited.length)} · Favorite category:{' '}
                {wrappedStats.favoriteCategory
                  ? CATEGORY_LABELS[wrappedStats.favoriteCategory]
                  : 'Mixed'}
              </Text>
            </View>
            <View style={styles.hiddenShare}>
              <ViewShot ref={shareRef} options={{ format: 'png', quality: 1 }}>
                <ShareCard stats={wrappedStats} />
              </ViewShot>
            </View>
            <PrimaryButton label="Share My Wrapped" onPress={shareWrapped} />
            <PrimaryButton
              label="Replay Wrapped"
              variant="secondary"
              onPress={() => {
                setIndex(0);
                listRef.current?.scrollToIndex({ index: 0, animated: true });
              }}
            />
            <PrimaryButton label="Close" variant="ghost" onPress={() => router.back()} />
          </WrappedSlide>
        );
      default:
        return null;
    }
    })();

    return <View style={{ width, height }}>{slide}</View>;
  };

  async function shareWrapped() {
    if (!(await Sharing.isAvailableAsync())) return;
    const uri = await shareRef.current?.capture();
    if (!uri) return;
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share Location Wrapped',
    });
  }

  const data = useMemo(() => SLIDES, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeTop}>
        <WrappedProgress total={SLIDES.length} index={index} />
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </SafeAreaView>

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setIndex(nextIndex);
        }}
        getItemLayout={(_, itemIndex) => ({
          length: width,
          offset: width * itemIndex,
          index: itemIndex,
        })}
      />

      <View style={styles.tapZones} pointerEvents="box-none">
        <Pressable
          style={styles.tapLeft}
          onPress={() => {
            const next = Math.max(index - 1, 0);
            setIndex(next);
            listRef.current?.scrollToIndex({ index: next, animated: true });
          }}
        />
        <Pressable
          style={styles.tapRight}
          onPress={() => {
            const next = Math.min(index + 1, SLIDES.length - 1);
            setIndex(next);
            listRef.current?.scrollToIndex({ index: next, animated: true });
          }}
        />
      </View>
    </View>
  );
}

function MetricLine({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metricLine}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{formatNumber(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  close: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  displayNumber: {
    color: '#FFFFFF',
    fontSize: typography.display,
    fontWeight: '900',
    fontFamily: 'Syne_800ExtraBold',
  },
  slideBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.subtitle,
    lineHeight: 28,
  },
  listGap: {
    gap: spacing.sm,
  },
  metricLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.body,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: typography.title,
    fontWeight: '800',
  },
  summaryMetrics: {
    gap: spacing.sm,
  },
  summaryLine: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: typography.body,
    lineHeight: 24,
  },
  hiddenShare: {
    position: 'absolute',
    opacity: 0,
    left: -9999,
    top: height,
  },
  tapZones: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 220,
    flexDirection: 'row',
    zIndex: 1,
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 1,
  },
});
