import { useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { Text, useThemeColor } from './Themed';

interface UserInfoCardProps {
  name: string;
  email: string;
  createdAt: string;
  role: string;
  avatar?: ImageSourcePropType;
}

export default function UserInfoCard({
  name,
  email,
  createdAt,
  role,
  avatar,
}: UserInfoCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const background = useThemeColor({ light: '#FFFFFF', dark: '#121212' }, 'background');
  const textPrimary = useThemeColor({ light: '#212121', dark: '#E0E0E0' }, 'text');
  const textSecondary = useThemeColor({ light: '#757575', dark: '#BDBDBD' }, 'text');
  const accent = useThemeColor({ light: '#4CAF50', dark: '#81C784' }, 'accent');

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
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
            borderLeftColor: accent,
          },
        ]}
      >
        <View style={styles.header}>
          <Image
            source={avatar || require('../assets/images/user.png')}
            style={styles.avatar}
          />
          <View>
            <Text style={[styles.name, { color: textPrimary }]}>{name}</Text>
            <Text style={[styles.role, { color: textSecondary }]}>{role}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={[styles.label, { color: textSecondary }]}>Correo</Text>
          <Text style={[styles.value, { color: textPrimary }]}>{email}</Text>
          <Text style={[styles.label, { color: textSecondary }]}>Creado</Text>
          <Text style={[styles.value, { color: textPrimary }]}>{createdAt}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  role: {
    fontSize: 14,
    fontWeight: '500',
  },
  info: {
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
});
