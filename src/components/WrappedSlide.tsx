import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/GradientBackground';
import { spacing, typography } from '@/constants/theme';

type Props = {
  colors: readonly [string, string, ...string[]];
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function WrappedSlide({ colors, eyebrow, title, subtitle, children }: Props) {
  return (
    <GradientBackground colors={colors} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: typography.hero,
    fontWeight: '800',
    lineHeight: 46,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: typography.subtitle,
    lineHeight: 28,
  },
});
