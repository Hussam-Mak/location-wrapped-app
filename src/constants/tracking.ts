export const LOCATION_TASK_NAME = 'location-wrapped-background-tracking';

export const TRACKING_CONFIG = {
  accuracy: 'balanced' as const,
  timeIntervalMs: 5 * 60 * 1000,
  distanceIntervalM: 75,
  visitRadiusM: 120,
  minVisitDurationMs: 8 * 60 * 1000,
  placeClusterRadiusM: 150,
  maxAccuracyM: 120,
  minMovementForTravelM: 40,
  maxSpeedMps: 55,
};

export const WRAPPED_MIN_VISITS = 8;
export const WRAPPED_MIN_DAYS = 3;
