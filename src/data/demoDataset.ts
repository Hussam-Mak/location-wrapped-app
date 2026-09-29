import type { LocationPoint, Place, PlaceCategory, Visit } from '@/types';
import { createId } from '@/utils/id';
import { attachVisitsToPlaces, clusterPlacesFromVisits } from '@/utils/visits';

type DemoPlaceSeed = {
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  visits: { dayOffset: number; hour: number; durationHours: number }[];
};

const DEMO_PLACES: DemoPlaceSeed[] = [
  {
    name: 'Home',
    category: 'home',
    latitude: 30.627,
    longitude: -96.334,
    visits: [
      { dayOffset: 0, hour: 23, durationHours: 7 },
      { dayOffset: 1, hour: 22, durationHours: 8 },
      { dayOffset: 2, hour: 23, durationHours: 7.5 },
      { dayOffset: 4, hour: 0, durationHours: 6 },
      { dayOffset: 7, hour: 23, durationHours: 8 },
      { dayOffset: 10, hour: 22, durationHours: 9 },
      { dayOffset: 14, hour: 23, durationHours: 7 },
      { dayOffset: 21, hour: 22, durationHours: 8 },
      { dayOffset: 28, hour: 23, durationHours: 7 },
      { dayOffset: 35, hour: 22, durationHours: 8 },
      { dayOffset: 45, hour: 23, durationHours: 7 },
      { dayOffset: 60, hour: 22, durationHours: 8 },
      { dayOffset: 75, hour: 23, durationHours: 7 },
      { dayOffset: 90, hour: 22, durationHours: 8 },
      { dayOffset: 120, hour: 23, durationHours: 7 },
    ],
  },
  {
    name: 'Texas A&M University',
    category: 'school',
    latitude: 30.618,
    longitude: -96.336,
    visits: [
      { dayOffset: 1, hour: 9, durationHours: 3.5 },
      { dayOffset: 2, hour: 10, durationHours: 4 },
      { dayOffset: 3, hour: 9, durationHours: 3 },
      { dayOffset: 5, hour: 11, durationHours: 2.5 },
      { dayOffset: 8, hour: 9, durationHours: 4 },
      { dayOffset: 12, hour: 10, durationHours: 3.5 },
      { dayOffset: 16, hour: 9, durationHours: 4 },
      { dayOffset: 22, hour: 10, durationHours: 3 },
      { dayOffset: 29, hour: 9, durationHours: 4 },
      { dayOffset: 40, hour: 11, durationHours: 3 },
      { dayOffset: 55, hour: 9, durationHours: 4 },
      { dayOffset: 70, hour: 10, durationHours: 3.5 },
      { dayOffset: 95, hour: 9, durationHours: 4 },
      { dayOffset: 130, hour: 10, durationHours: 3 },
    ],
  },
  {
    name: 'Engineering Building',
    category: 'school',
    latitude: 30.6195,
    longitude: -96.3395,
    visits: [
      { dayOffset: 1, hour: 13, durationHours: 2 },
      { dayOffset: 4, hour: 14, durationHours: 2.5 },
      { dayOffset: 9, hour: 13, durationHours: 2 },
      { dayOffset: 18, hour: 15, durationHours: 2 },
      { dayOffset: 32, hour: 14, durationHours: 2.5 },
      { dayOffset: 50, hour: 13, durationHours: 2 },
      { dayOffset: 88, hour: 14, durationHours: 2 },
    ],
  },
  {
    name: 'Campus Coffee Shop',
    category: 'food',
    latitude: 30.6168,
    longitude: -96.3318,
    visits: [
      { dayOffset: 1, hour: 8, durationHours: 0.75 },
      { dayOffset: 3, hour: 8, durationHours: 1 },
      { dayOffset: 6, hour: 15, durationHours: 0.5 },
      { dayOffset: 11, hour: 8, durationHours: 0.75 },
      { dayOffset: 20, hour: 16, durationHours: 0.5 },
      { dayOffset: 33, hour: 8, durationHours: 1 },
      { dayOffset: 48, hour: 15, durationHours: 0.75 },
      { dayOffset: 72, hour: 8, durationHours: 0.5 },
      { dayOffset: 110, hour: 16, durationHours: 0.75 },
    ],
  },
  {
    name: 'Rec Center Gym',
    category: 'fitness',
    latitude: 30.6125,
    longitude: -96.341,
    visits: [
      { dayOffset: 2, hour: 18, durationHours: 1.25 },
      { dayOffset: 5, hour: 17, durationHours: 1.5 },
      { dayOffset: 9, hour: 18, durationHours: 1 },
      { dayOffset: 15, hour: 17, durationHours: 1.25 },
      { dayOffset: 24, hour: 18, durationHours: 1.5 },
      { dayOffset: 38, hour: 17, durationHours: 1 },
      { dayOffset: 62, hour: 18, durationHours: 1.25 },
      { dayOffset: 85, hour: 17, durationHours: 1.5 },
    ],
  },
  {
    name: 'Grocery Store',
    category: 'shopping',
    latitude: 30.634,
    longitude: -96.322,
    visits: [
      { dayOffset: 3, hour: 19, durationHours: 0.75 },
      { dayOffset: 10, hour: 18, durationHours: 1 },
      { dayOffset: 24, hour: 19, durationHours: 0.75 },
      { dayOffset: 41, hour: 17, durationHours: 1 },
      { dayOffset: 68, hour: 18, durationHours: 0.75 },
      { dayOffset: 102, hour: 19, durationHours: 1 },
    ],
  },
  {
    name: 'Local Restaurant',
    category: 'food',
    latitude: 30.631,
    longitude: -96.328,
    visits: [
      { dayOffset: 4, hour: 19, durationHours: 1.25 },
      { dayOffset: 13, hour: 20, durationHours: 1.5 },
      { dayOffset: 27, hour: 19, durationHours: 1 },
      { dayOffset: 44, hour: 20, durationHours: 1.25 },
      { dayOffset: 77, hour: 19, durationHours: 1.5 },
    ],
  },
  {
    name: 'City Park',
    category: 'outdoors',
    latitude: 30.642,
    longitude: -96.348,
    visits: [
      { dayOffset: 6, hour: 11, durationHours: 1.5 },
      { dayOffset: 19, hour: 10, durationHours: 2 },
      { dayOffset: 52, hour: 17, durationHours: 1.25 },
      { dayOffset: 98, hour: 11, durationHours: 1.75 },
    ],
  },
  {
    name: 'Movie Theater',
    category: 'entertainment',
    latitude: 30.638,
    longitude: -96.315,
    visits: [
      { dayOffset: 8, hour: 21, durationHours: 2.5 },
      { dayOffset: 36, hour: 20, durationHours: 2.25 },
      { dayOffset: 89, hour: 21, durationHours: 2.5 },
    ],
  },
  {
    name: 'Internship Office',
    category: 'work',
    latitude: 30.6295,
    longitude: -96.305,
    visits: [
      { dayOffset: 14, hour: 9, durationHours: 4 },
      { dayOffset: 15, hour: 9, durationHours: 4.5 },
      { dayOffset: 16, hour: 9, durationHours: 4 },
      { dayOffset: 17, hour: 9, durationHours: 3.5 },
      { dayOffset: 21, hour: 9, durationHours: 4 },
      { dayOffset: 28, hour: 9, durationHours: 4 },
      { dayOffset: 35, hour: 9, durationHours: 4.5 },
    ],
  },
  {
    name: 'Easterwood Airport',
    category: 'travel',
    latitude: 30.588,
    longitude: -96.364,
    visits: [
      { dayOffset: 42, hour: 6, durationHours: 1.5 },
      { dayOffset: 46, hour: 14, durationHours: 1.25 },
    ],
  },
  {
    name: 'Houston Weekend',
    category: 'travel',
    latitude: 29.7604,
    longitude: -95.3698,
    visits: [
      { dayOffset: 43, hour: 12, durationHours: 28 },
      { dayOffset: 44, hour: 10, durationHours: 6 },
    ],
  },
  {
    name: 'Austin Day Trip',
    category: 'travel',
    latitude: 30.2672,
    longitude: -97.7431,
    visits: [{ dayOffset: 67, hour: 9, durationHours: 10 }],
  },
];

function jitter(value: number, amount: number): number {
  return value + (Math.random() - 0.5) * amount;
}

function buildDemoVisits(): Visit[] {
  const now = Date.now();
  const start = now - 150 * 24 * 60 * 60 * 1000;
  const visits: Visit[] = [];

  for (const place of DEMO_PLACES) {
    for (const pattern of place.visits) {
      const arrival = new Date(start);
      arrival.setDate(arrival.getDate() + pattern.dayOffset);
      arrival.setHours(pattern.hour, 10, 0, 0);
      const durationMs = pattern.durationHours * 60 * 60 * 1000;
      const departure = arrival.getTime() + durationMs;

      visits.push({
        id: createId('demo_visit'),
        placeId: null,
        latitude: jitter(place.latitude, 0.0008),
        longitude: jitter(place.longitude, 0.0008),
        arrivalTime: arrival.getTime(),
        departureTime: departure,
        durationMs,
        pointCount: Math.max(3, Math.round(pattern.durationHours * 2)),
        placeName: place.name,
        category: place.category,
        isDemo: true,
      });
    }
  }

  return visits.sort((a, b) => a.arrivalTime - b.arrivalTime);
}

function buildDemoPoints(visits: Visit[]): LocationPoint[] {
  const points: LocationPoint[] = [];

  for (const visit of visits) {
    const samples = Math.max(3, visit.pointCount);
    for (let index = 0; index < samples; index += 1) {
      const ratio = samples <= 1 ? 0 : index / (samples - 1);
      const timestamp = visit.arrivalTime + ratio * visit.durationMs;
      points.push({
        id: createId('demo_point'),
        latitude: jitter(visit.latitude, 0.0004),
        longitude: jitter(visit.longitude, 0.0004),
        timestamp,
        accuracy: 12 + Math.random() * 18,
        altitude: null,
        speed: index === 0 ? 0 : 1.2 + Math.random() * 2,
        isDemo: true,
      });
    }

    if (Math.random() > 0.55) {
      points.push({
        id: createId('demo_point'),
        latitude: jitter(visit.latitude, 0.002),
        longitude: jitter(visit.longitude, 0.002),
        timestamp: visit.departureTime + 15 * 60 * 1000,
        accuracy: 20,
        altitude: null,
        speed: 8 + Math.random() * 6,
        isDemo: true,
      });
    }
  }

  return points.sort((a, b) => a.timestamp - b.timestamp);
}

export function generateDemoDataset(): {
  points: LocationPoint[];
  visits: Visit[];
  places: Place[];
} {
  const visits = buildDemoVisits();
  const places = clusterPlacesFromVisits(visits).map((place) => {
    const seed = DEMO_PLACES.find(
      (candidate) =>
        Math.abs(candidate.latitude - place.latitude) < 0.01 &&
        Math.abs(candidate.longitude - place.longitude) < 0.01,
    );
    return {
      ...place,
      name: seed?.name ?? place.name,
      category: seed?.category ?? place.category,
      isDemo: true,
    };
  });
  const linkedVisits = attachVisitsToPlaces(visits, places);
  const points = buildDemoPoints(linkedVisits);
  return { points, visits: linkedVisits, places };
}
