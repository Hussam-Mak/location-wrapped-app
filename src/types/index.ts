export type PlaceCategory =
  | 'home'
  | 'school'
  | 'work'
  | 'food'
  | 'shopping'
  | 'fitness'
  | 'entertainment'
  | 'outdoors'
  | 'travel'
  | 'other';

export type LocationPoint = {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  isDemo: boolean;
};

export type Visit = {
  id: string;
  placeId: string | null;
  latitude: number;
  longitude: number;
  arrivalTime: number;
  departureTime: number;
  durationMs: number;
  pointCount: number;
  placeName: string | null;
  category: PlaceCategory;
  isDemo: boolean;
};

export type Place = {
  id: string;
  latitude: number;
  longitude: number;
  name: string | null;
  address: string | null;
  category: PlaceCategory;
  visitCount: number;
  totalTimeMs: number;
  firstVisited: number;
  lastVisited: number;
  isDemo: boolean;
};

export type MonthlyStats = {
  monthKey: string;
  label: string;
  visitCount: number;
  uniquePlaces: number;
  distanceMiles: number;
  trackedMs: number;
};

export type WrappedStats = {
  year: number;
  daysTracked: number;
  placesVisited: number;
  totalVisits: number;
  distanceMiles: number;
  topPlace: Place | null;
  topPlaces: Place[];
  categoryBreakdown: { category: PlaceCategory; hours: number; percent: number }[];
  monthlyActivity: MonthlyStats[];
  mostActiveMonth: MonthlyStats | null;
  uniqueLocations: number;
  newLocations: number;
  repeatLocations: number;
  citiesVisited: string[];
  favoriteCategory: PlaceCategory | null;
  personalityTitle: string;
  personalityDescription: string;
  totalTrackedHours: number;
  hasEnoughData: boolean;
};

export type AppSettings = {
  onboardingComplete: boolean;
  trackingPaused: boolean;
  demoModeEnabled: boolean;
  lastProcessedAt: number | null;
};

export type StorageCounts = {
  points: number;
  visits: number;
  places: number;
};

export type LocationPermissionState = {
  foreground: 'granted' | 'denied' | 'undetermined';
  background: 'granted' | 'denied' | 'undetermined';
  servicesEnabled: boolean;
};

export type BackupPayload = {
  version: 1;
  exportedAt: number;
  settings: AppSettings;
  points: LocationPoint[];
  visits: Visit[];
  places: Place[];
};

export type DayVisitGroup = {
  dayKey: string;
  label: string;
  visits: Visit[];
};
