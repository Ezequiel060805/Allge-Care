import React, { useRef } from 'react';
import { View, Image, StyleSheet, Pressable, Animated } from 'react-native';
import { Text } from './Themed';

interface ValueCardProps {
  value: string;
}

const iconExclamation = require('@/assets/images/iconosComponentes/6.png');

export function ValueCard({ value }: ValueCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={{ margin: 8 }}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale }], backgroundColor: '#FFB347' },
        ]}
      >
        <View style={styles.iconContainer}>
          <Image source={iconExclamation} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Alerta!</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#00000020',
  },
  image: {
    width: 88,
    height: 88,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#424242',
  },
});

