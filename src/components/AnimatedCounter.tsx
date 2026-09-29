import { useEffect, useState } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';

type Props = {
  value: number;
  suffix?: string;
  decimals?: number;
  style?: TextStyle;
};

export function AnimatedCounter({ value, suffix = '', decimals = 0, style }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = Date.now();
    const duration = 900;
    const from = display;

    const tick = () => {
      const progress = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(from + (value - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString('en-US');

  return <Text style={[styles.text, style]}>{`${formatted}${suffix}`}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontVariant: ['tabular-nums'],
  },
});
