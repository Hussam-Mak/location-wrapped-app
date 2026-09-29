import { generateDemoDataset } from '../src/data/demoDataset';
import { buildWrappedStats } from '../src/utils/stats';

const dataset = generateDemoDataset();
const stats = buildWrappedStats(dataset.points, dataset.visits, dataset.places, 2026);

if (!stats.hasEnoughData) {
  console.error('Demo dataset did not produce enough Wrapped data.');
  process.exit(1);
}

if (stats.placesVisited < 8) {
  console.error('Expected at least 8 demo places.');
  process.exit(1);
}

if (stats.topPlaces.length < 5) {
  console.error('Expected at least 5 top places.');
  process.exit(1);
}

console.log('Demo Wrapped stats OK:', {
  placesVisited: stats.placesVisited,
  totalVisits: stats.totalVisits,
  distanceMiles: Math.round(stats.distanceMiles),
  personality: stats.personalityTitle,
});
