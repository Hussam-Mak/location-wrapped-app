const EARTH_RADIUS_M = 6371000;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function metersToMiles(meters: number): number {
  return meters / 1609.344;
}

export function averageCoordinate(
  points: { latitude: number; longitude: number }[],
): { latitude: number; longitude: number } {
  if (points.length === 0) return { latitude: 0, longitude: 0 };
  const sum = points.reduce(
    (acc, point) => ({
      latitude: acc.latitude + point.latitude,
      longitude: acc.longitude + point.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );
  return {
    latitude: sum.latitude / points.length,
    longitude: sum.longitude / points.length,
  };
}

export function inferCityLabel(latitude: number, longitude: number): string {
  if (latitude > 30.4 && latitude < 30.8 && longitude > -96.5 && longitude < -96.1) {
    return 'College Station';
  }
  if (latitude > 29.6 && latitude < 30.0 && longitude > -95.5 && longitude < -95.1) {
    return 'Houston';
  }
  if (latitude > 30.2 && latitude < 30.5 && longitude > -97.9 && longitude < -97.6) {
    return 'Austin';
  }
  const latBand = Math.round(latitude * 10) / 10;
  const lonBand = Math.round(longitude * 10) / 10;
  return `${latBand}°, ${lonBand}°`;
}

export function isValidReading(
  accuracy: number | null,
  speed: number | null,
  maxAccuracyM: number,
  maxSpeedMps: number,
): boolean {
  if (accuracy != null && accuracy > maxAccuracyM) return false;
  if (speed != null && speed > maxSpeedMps) return false;
  return true;
}
