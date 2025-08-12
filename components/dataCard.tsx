import { useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Text, useThemeColor } from './Themed';

interface DataCardProps {
  image: any;
  title: string;
  value: any;
}

export default function DataCard({ image, title, value }: DataCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const background = useThemeColor({ light: '#FFFFFF', dark: '#1E1E1E' }, 'background');
  const accent = useThemeColor({ light: '#2196F3', dark: '#90CAF9' }, 'accent');
  const accentBg = useThemeColor(
    { light: '#f2f2f2', dark: '#90CAF930' },
    'background'
  );
  const textPrimary = useThemeColor({ light: '#212121', dark: '#E0E0E0' }, 'text');
  const textSecondary = useThemeColor({ light: '#757575', dark: '#BDBDBD' }, 'text');

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={styles.wrapper}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: background,
            transform: [{ scale }],
          },
        ]}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: accentBg }]}
        >
          <Image source={image} style={styles.image} resizeMode="contain" />
        </View>
        <Text style={[styles.title, { color: textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.value, { color: textSecondary }]}>
          {value == null || value === '' ? '—' : String(value)}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 88,
    height: 88,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
});
