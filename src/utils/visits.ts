import { TRACKING_CONFIG } from '@/constants/tracking';
import type { LocationPoint, Place, PlaceCategory, Visit } from '@/types';
import { createId } from '@/utils/id';
import { averageCoordinate, haversineDistanceM } from '@/utils/geo';

type VisitDraft = {
  points: LocationPoint[];
  arrivalTime: number;
  departureTime: number;
};

function finalizeDraft(draft: VisitDraft, isDemo: boolean): Visit {
  const center = averageCoordinate(draft.points);
  const durationMs = Math.max(
    draft.departureTime - draft.arrivalTime,
    TRACKING_CONFIG.minVisitDurationMs / 2,
  );
  return {
    id: createId('visit'),
    placeId: null,
    latitude: center.latitude,
    longitude: center.longitude,
    arrivalTime: draft.arrivalTime,
    departureTime: draft.departureTime,
    durationMs,
    pointCount: draft.points.length,
    placeName: null,
    category: 'other',
    isDemo,
  };
}

export function detectVisitsFromPoints(points: LocationPoint[]): Visit[] {
  if (points.length === 0) return [];

  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  const visits: Visit[] = [];
  let current: VisitDraft | null = null;

  for (const point of sorted) {
    if (!current) {
      current = {
        points: [point],
        arrivalTime: point.timestamp,
        departureTime: point.timestamp,
      };
      continue;
    }

    const center = averageCoordinate(current.points);
    const distance = haversineDistanceM(
      center.latitude,
      center.longitude,
      point.latitude,
      point.longitude,
    );
    const gapMs = point.timestamp - current.departureTime;

    if (distance <= TRACKING_CONFIG.visitRadiusM && gapMs <= TRACKING_CONFIG.timeIntervalMs * 2) {
      current.points.push(point);
      current.departureTime = point.timestamp;
      continue;
    }

    const duration = current.departureTime - current.arrivalTime;
    if (duration >= TRACKING_CONFIG.minVisitDurationMs) {
      visits.push(finalizeDraft(current, point.isDemo));
    }

    current = {
      points: [point],
      arrivalTime: point.timestamp,
      departureTime: point.timestamp,
    };
  }

  if (current) {
    const duration = current.departureTime - current.arrivalTime;
    if (duration >= TRACKING_CONFIG.minVisitDurationMs) {
      visits.push(finalizeDraft(current, sorted[0]?.isDemo ?? false));
    }
  }

  return mergeNearbyVisits(visits);
}

function mergeNearbyVisits(visits: Visit[]): Visit[] {
  if (visits.length <= 1) return visits;
  const merged: Visit[] = [];
  let current = visits[0];

  for (let index = 1; index < visits.length; index += 1) {
    const next = visits[index];
    const distance = haversineDistanceM(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude,
    );
    const gap = next.arrivalTime - current.departureTime;

    if (
      distance <= TRACKING_CONFIG.placeClusterRadiusM &&
      gap <= TRACKING_CONFIG.timeIntervalMs * 3
    ) {
      const durationMs = next.departureTime - current.arrivalTime;
      current = {
        ...current,
        departureTime: next.departureTime,
        durationMs,
        pointCount: current.pointCount + next.pointCount,
        latitude: (current.latitude + next.latitude) / 2,
        longitude: (current.longitude + next.longitude) / 2,
      };
      continue;
    }

    merged.push(current);
    current = next;
  }

  merged.push(current);
  return merged;
}

export function clusterPlacesFromVisits(visits: Visit[]): Place[] {
  const places: Place[] = [];

  for (const visit of visits) {
    const match = places.find(
      (place) =>
        haversineDistanceM(place.latitude, place.longitude, visit.latitude, visit.longitude) <=
        TRACKING_CONFIG.placeClusterRadiusM,
    );

    if (!match) {
      places.push({
        id: createId('place'),
        latitude: visit.latitude,
        longitude: visit.longitude,
        name: visit.placeName,
        address: null,
        category: visit.category,
        visitCount: 1,
        totalTimeMs: visit.durationMs,
        firstVisited: visit.arrivalTime,
        lastVisited: visit.departureTime,
        isDemo: visit.isDemo,
      });
      continue;
    }

    const totalVisits = match.visitCount + 1;
    match.latitude =
      (match.latitude * match.visitCount + visit.latitude) / totalVisits;
    match.longitude =
      (match.longitude * match.visitCount + visit.longitude) / totalVisits;
    match.visitCount = totalVisits;
    match.totalTimeMs += visit.durationMs;
    match.firstVisited = Math.min(match.firstVisited, visit.arrivalTime);
    match.lastVisited = Math.max(match.lastVisited, visit.departureTime);
    match.name = match.name ?? visit.placeName;
    match.category = match.category === 'other' ? visit.category : match.category;
  }

  return places;
}

export function attachVisitsToPlaces(visits: Visit[], places: Place[]): Visit[] {
  return visits.map((visit) => {
    const place = places.find(
      (candidate) =>
        haversineDistanceM(
          candidate.latitude,
          candidate.longitude,
          visit.latitude,
          visit.longitude,
        ) <= TRACKING_CONFIG.placeClusterRadiusM,
    );

    if (!place) return visit;

    return {
      ...visit,
      placeId: place.id,
      placeName: place.name,
      category: place.category,
    };
  });
}

export function updatePlaceCategory(placeId: string, category: PlaceCategory, places: Place[]): Place[] {
  return places.map((place) => (place.id === placeId ? { ...place, category } : place));
}

export function renamePlace(placeId: string, name: string, places: Place[]): Place[] {
  return places.map((place) => (place.id === placeId ? { ...place, name } : place));
}
