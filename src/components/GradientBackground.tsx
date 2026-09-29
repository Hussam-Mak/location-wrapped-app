import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  colors: readonly [string, string, ...string[]];
};

export function GradientBackground({ colors, style, children, ...rest }: Props) {
  return (
    <View style={[styles.container, style]} {...rest}>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
