import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  size?: number;
};

export function MapVisual({ size = 180 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />
      <View style={styles.pin}>
        <Ionicons name="location" size={42} color="#FFFFFF" />
      </View>
      <View style={[styles.orbit, styles.orbitOne]} />
      <View style={[styles.orbit, styles.orbitTwo]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  ringInner: {
    position: 'absolute',
    width: '72%',
    height: '72%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  pin: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: 'rgba(124,92,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#FF6B6B',
  },
  orbitOne: {
    top: 18,
    right: 28,
  },
  orbitTwo: {
    bottom: 24,
    left: 22,
    backgroundColor: '#3DDC97',
  },
});
