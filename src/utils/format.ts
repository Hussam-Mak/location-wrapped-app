export function formatNumber(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
}

export function formatMiles(miles: number): string {
  if (miles >= 100) return formatNumber(miles, 0);
  if (miles >= 10) return formatNumber(miles, 1);
  return formatNumber(miles, 2);
}

export function formatHours(ms: number): string {
  const hours = ms / (1000 * 60 * 60);
  if (hours >= 10) return `${formatNumber(hours, 0)} hrs`;
  if (hours >= 1) return `${formatNumber(hours, 1)} hrs`;
  const minutes = Math.round(ms / (1000 * 60));
  return `${minutes} min`;
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(1, Math.round(ms / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function formatDayLabel(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(timestamp));
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
}

export function monthKeyFromTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}

export function dayKeyFromTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function distanceComparison(miles: number): string {
  if (miles >= 2400) return 'About the width of the continental United States';
  if (miles >= 1000) return 'Longer than a drive from Dallas to Denver';
  if (miles >= 500) return 'About the distance from Chicago to Nashville';
  if (miles >= 100) return 'Like a weekend road trip across your state';
  return 'Enough little journeys to fill a great story';
}
