import type { PlaceCategory } from '@/types';
import { CATEGORY_LABELS } from '@/constants/categories';

type PersonalityInput = {
  placesVisited: number;
  distanceMiles: number;
  repeatRatio: number;
  citiesVisited: number;
  favoriteCategory: PlaceCategory | null;
};

export function derivePersonality(input: PersonalityInput): { title: string; description: string } {
  const { placesVisited, distanceMiles, repeatRatio, citiesVisited, favoriteCategory } = input;

  if (citiesVisited >= 3 && distanceMiles >= 800) {
    return {
      title: 'The Wanderer',
      description: 'You covered serious ground this year and kept finding new corners of the map.',
    };
  }

  if (repeatRatio >= 0.55 && placesVisited >= 8) {
    return {
      title: 'The Regular',
      description: 'Your favorite spots earned repeat visits — comfort, routine, and a rhythm you know well.',
    };
  }

  if (placesVisited >= 20 && repeatRatio < 0.45) {
    return {
      title: 'The Explorer',
      description: 'You kept discovering new places instead of staying in one lane.',
    };
  }

  if (placesVisited >= 10 && repeatRatio >= 0.35 && citiesVisited <= 2) {
    return {
      title: 'The Local Legend',
      description: 'You know your city deeply — a handful of places carry most of your story.',
    };
  }

  const categoryLabel = favoriteCategory ? CATEGORY_LABELS[favoriteCategory] : 'your favorite spots';
  return {
    title: 'The Pathfinder',
    description: `Your year balanced movement and memory, with ${categoryLabel.toLowerCase()} shaping a lot of your time.`,
  };
}
