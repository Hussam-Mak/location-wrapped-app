import type { PlaceCategory } from '@/types';

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  home: 'Home',
  school: 'School',
  work: 'Work',
  food: 'Food',
  shopping: 'Shopping',
  fitness: 'Fitness',
  entertainment: 'Entertainment',
  outdoors: 'Outdoors',
  travel: 'Travel',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  home: '#7C5CFF',
  school: '#4ECDC4',
  work: '#FFB347',
  food: '#FF6B6B',
  shopping: '#C084FC',
  fitness: '#3DDC97',
  entertainment: '#FF5C8A',
  outdoors: '#6BCB77',
  travel: '#60A5FA',
  other: '#94A3B8',
};

export const CATEGORY_ORDER: PlaceCategory[] = [
  'home',
  'work',
  'school',
  'food',
  'fitness',
  'shopping',
  'entertainment',
  'outdoors',
  'travel',
  'other',
];
