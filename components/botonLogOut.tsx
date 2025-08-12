// LogoutButton.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { deleteItemAsync } from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await deleteItemAsync('userToken');
    await deleteItemAsync('email_persistent')
    router.replace('/');
  };

  return (
    <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={handleLogout}>
      <Text style={styles.buttonText}>Cerrar sesión</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E63946',    // Rojo intenso
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',           // Sombra suave (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,                  // Sombra suave (Android)
    marginHorizontal: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

