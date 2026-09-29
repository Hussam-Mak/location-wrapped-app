import { CATEGORY_ORDER } from '@/constants/categories';
import { TRACKING_CONFIG, WRAPPED_MIN_DAYS, WRAPPED_MIN_VISITS } from '@/constants/tracking';
import type { LocationPoint, MonthlyStats, Place, PlaceCategory, Visit, WrappedStats } from '@/types';
import { dayKeyFromTimestamp, formatMonthLabel, monthKeyFromTimestamp } from '@/utils/format';
import { haversineDistanceM, inferCityLabel, metersToMiles } from '@/utils/geo';
import { derivePersonality } from '@/utils/personality';

function uniqueDayKeys(points: LocationPoint[], visits: Visit[]): number {
  const keys = new Set<string>();
  for (const point of points) keys.add(dayKeyFromTimestamp(point.timestamp));
  for (const visit of visits) keys.add(dayKeyFromTimestamp(visit.arrivalTime));
  return keys.size;
}

export function calculateTravelDistanceMiles(points: LocationPoint[]): number {
  if (points.length < 2) return 0;

  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  let totalMeters = 0;

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    const distance = haversineDistanceM(
      previous.latitude,
      previous.longitude,
      current.latitude,
      current.longitude,
    );

    if (distance < TRACKING_CONFIG.minMovementForTravelM) continue;
    if (distance > 50_000) continue;
    totalMeters += distance;
  }

  return metersToMiles(totalMeters);
}

export function getTopPlaces(places: Place[], limit = 5): Place[] {
  return [...places].sort((a, b) => b.totalTimeMs - a.totalTimeMs).slice(0, limit);
}

export function getCategoryBreakdown(places: Place[]): {
  category: PlaceCategory;
  hours: number;
  percent: number;
}[] {
  const totals = new Map<PlaceCategory, number>();
  for (const category of CATEGORY_ORDER) totals.set(category, 0);

  let grandTotal = 0;
  for (const place of places) {
    grandTotal += place.totalTimeMs;
    totals.set(place.category, (totals.get(place.category) ?? 0) + place.totalTimeMs);
  }

  if (grandTotal <= 0) {
    return CATEGORY_ORDER.map((category) => ({ category, hours: 0, percent: 0 }));
  }

  return CATEGORY_ORDER.map((category) => {
    const ms = totals.get(category) ?? 0;
    return {
      category,
      hours: ms / (1000 * 60 * 60),
      percent: (ms / grandTotal) * 100,
    };
  }).filter((entry) => entry.hours > 0);
}

export function getMonthlyActivity(visits: Visit[], points: LocationPoint[]): MonthlyStats[] {
  const map = new Map<string, MonthlyStats>();

  for (const visit of visits) {
    const key = monthKeyFromTimestamp(visit.arrivalTime);
    const existing = map.get(key) ?? {
      monthKey: key,
      label: formatMonthLabel(key),
      visitCount: 0,
      uniquePlaces: 0,
      distanceMiles: 0,
      trackedMs: 0,
    };
    existing.visitCount += 1;
    existing.trackedMs += visit.durationMs;
    map.set(key, existing);
  }

  for (const point of points) {
    const key = monthKeyFromTimestamp(point.timestamp);
    const existing = map.get(key) ?? {
      monthKey: key,
      label: formatMonthLabel(key),
      visitCount: 0,
      uniquePlaces: 0,
      distanceMiles: 0,
      trackedMs: 0,
    };
    map.set(key, existing);
  }

  return [...map.values()].sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

export function getMostActiveMonth(monthly: MonthlyStats[]): MonthlyStats | null {
  if (monthly.length === 0) return null;
  return [...monthly].sort((a, b) => b.visitCount - a.visitCount)[0];
}

export function getCitiesVisited(places: Place[]): string[] {
  const cities = new Set<string>();
  for (const place of places) {
    cities.add(inferCityLabel(place.latitude, place.longitude));
  }
  return [...cities];
}

export function getNewVsRepeat(places: Place[]): { unique: number; repeat: number; new: number } {
  const unique = places.length;
  const repeat = places.filter((place) => place.visitCount > 1).length;
  const newlyDiscovered = places.filter((place) => place.visitCount === 1).length;
  return { unique, repeat, new: newlyDiscovered };
}

export function buildWrappedStats(
  points: LocationPoint[],
  visits: Visit[],
  places: Place[],
  year = new Date().getFullYear(),
): WrappedStats {
  const daysTracked = uniqueDayKeys(points, visits);
  const topPlaces = getTopPlaces(places, 5);
  const categoryBreakdown = getCategoryBreakdown(places);
  const monthlyActivity = getMonthlyActivity(visits, points);
  const mostActiveMonth = getMostActiveMonth(monthlyActivity);
  const citiesVisited = getCitiesVisited(places);
  const exploration = getNewVsRepeat(places);
  const distanceMiles = calculateTravelDistanceMiles(points);
  const totalTrackedMs = places.reduce((sum, place) => sum + place.totalTimeMs, 0);
  const favoriteCategory =
    [...categoryBreakdown].sort((a, b) => b.hours - a.hours)[0]?.category ?? null;
  const personality = derivePersonality({
    placesVisited: places.length,
    distanceMiles,
    repeatRatio: places.length ? exploration.repeat / places.length : 0,
    citiesVisited: citiesVisited.length,
    favoriteCategory,
  });

  const hasEnoughData =
    visits.length >= WRAPPED_MIN_VISITS && daysTracked >= WRAPPED_MIN_DAYS && places.length >= 3;

  return {
    year,
    daysTracked,
    placesVisited: places.length,
    totalVisits: visits.length,
    distanceMiles,
    topPlace: topPlaces[0] ?? null,
    topPlaces,
    categoryBreakdown,
    monthlyActivity,
    mostActiveMonth,
    uniqueLocations: exploration.unique,
    newLocations: exploration.new,
    repeatLocations: exploration.repeat,
    citiesVisited,
    favoriteCategory,
    personalityTitle: personality.title,
    personalityDescription: personality.description,
    totalTrackedHours: totalTrackedMs / (1000 * 60 * 60),
    hasEnoughData,
  };
}

export function groupVisitsByDay(visits: Visit[]): { dayKey: string; label: string; visits: Visit[] }[] {
  const groups = new Map<string, Visit[]>();

  for (const visit of [...visits].sort((a, b) => b.arrivalTime - a.arrivalTime)) {
    const key = dayKeyFromTimestamp(visit.arrivalTime);
    const bucket = groups.get(key) ?? [];
    bucket.push(visit);
    groups.set(key, bucket);
  }

  return [...groups.entries()].map(([dayKey, dayVisits]) => ({
    dayKey,
    label: formatDayLabel(dayVisits[0].arrivalTime),
    visits: dayVisits.sort((a, b) => b.arrivalTime - a.arrivalTime),
  }));
}

function formatDayLabel(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(timestamp));
}
