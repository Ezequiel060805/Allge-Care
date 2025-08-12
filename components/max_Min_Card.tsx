import { useRef } from 'react';
import { View, Image, StyleSheet, Pressable, Animated } from 'react-native';
import { Text } from './Themed';  // Componente Text con soporte de tema

interface MaxMinCardProps {
  title: string;
  min: string;
  max: string;
  image: any;
  bgColor: string;
}

export function Max_Min_Card({ title, min, max, image, bgColor }: MaxMinCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  // Animaciones de feedback táctil (reduce levemente el tamaño al presionar)
  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={styles.wrapper}>
      <Animated.View style={[styles.card, { backgroundColor: bgColor, transform: [{ scale }] }]}>
        {/* Ícono circular */}
        <View style={styles.iconContainer}>
          <Image source={image} style={styles.image} resizeMode="contain" />
        </View>
        {/* Textos */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{`Min: \n${min}`}</Text>
          <Text style={styles.value}>{`Max: \n${max}`}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',           // ancho relativo para adaptarse al contenedor
    marginVertical: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    // Sombra sutil para elevación:
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
    backgroundColor: '#00000020'  // fondo semitransparente para resaltar icono ligeramente
  },
  image: {
    width: 88,
    height: 88
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121'       // color oscuro fijo para buen contraste
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#424242'       // gris oscuro para diferenciar ligeramente del título
  }
});

