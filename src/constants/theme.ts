export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const colors = {
  background: '#07070F',
  surface: '#12121C',
  surfaceElevated: '#1A1A28',
  border: 'rgba(255,255,255,0.08)',
  text: '#F5F5FA',
  textMuted: 'rgba(245,245,250,0.65)',
  textSubtle: 'rgba(245,245,250,0.45)',
  accent: '#7C5CFF',
  accentAlt: '#FF6B6B',
  success: '#3DDC97',
  warning: '#FFB347',
  danger: '#FF5C8A',
  tabInactive: 'rgba(245,245,250,0.45)',
} as const;

export const gradients = {
  wrappedIntro: ['#1B0F3A', '#3D1E6D', '#FF6B6B'] as const,
  wrappedPlaces: ['#0F2027', '#203A43', '#2C5364'] as const,
  wrappedDistance: ['#141E30', '#243B55', '#7C5CFF'] as const,
  wrappedTop: ['#200122', '#6f0000', '#FF6B6B'] as const,
  wrappedCategories: ['#0F0C29', '#302B63', '#24243E'] as const,
  wrappedMonth: ['#134E5E', '#71B280', '#FFD200'] as const,
  wrappedExplore: ['#232526', '#414345', '#7C5CFF'] as const,
  wrappedPersonality: ['#000428', '#004e92', '#00d2ff'] as const,
  wrappedFinal: ['#1A0535', '#3D1766', '#FF8C42'] as const,
  card: ['#1A1A28', '#12121C'] as const,
};

export const typography = {
  display: 56,
  hero: 42,
  title: 28,
  subtitle: 20,
  body: 16,
  caption: 13,
} as const;

export const layout = {
  screenPadding: spacing.md,
  tabBarHeight: 64,
} as const;
