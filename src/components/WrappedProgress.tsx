import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radii, spacing } from '@/constants/theme';

type Props = {
  total: number;
  index: number;
};

export function WrappedProgress({ total, index }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, barIndex) => (
        <Bar key={barIndex} active={barIndex <= index} current={barIndex === index} />
      ))}
    </View>
  );
}

function Bar({ active, current }: { active: boolean; current: boolean }) {
  const style = useAnimatedStyle(() => ({
    flex: current ? withTiming(1.6, { duration: 250, easing: Easing.out(Easing.cubic) }) : 1,
    opacity: withTiming(active ? 1 : 0.35, { duration: 250 }),
  }));

  return (
    <Animated.View style={[styles.bar, style, active && styles.barActive]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  bar: {
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  barActive: {
    backgroundColor: colors.text,
  },
});
