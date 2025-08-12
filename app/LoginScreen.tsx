import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useThemeColor, Text } from '../components/Themed';
import Colors from '../constants/Colors';
import * as SecureStore from 'expo-secure-store';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const API_URL = 'https://allge-care-apis.onrender.com/api/login'
//const API_URL = 'http://10.0.2.2:3000/api/login';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Colores según tema
  const background = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    'background'
  );
  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    'text'
  );
  const primary = useThemeColor(
    { light: '#4CAF50', dark: '#81C784' },
    'tint'
  );
  const secondary = useThemeColor(
    { light: '#FFEB3B', dark: '#FFF59D' },
    'tint'
  );
  const inputBackground = useThemeColor(
    { light: '#4CAF5020', dark: '#81C78420' },
    'background'
  );

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('userToken', data.token);
        await SecureStore.setItemAsync('email_persistent', email);
        onLoginSuccess();
      } else {
        setError(data.error || 'Error de login')
      }
    } catch (e) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logoAllge-Care.png')}
            style={styles.logo}
          />
        </View>

        {/* Títulos */}
        <Text style={[styles.title, { color: primary }]}>Bienvenido</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>Inicia sesión para continuar</Text>

        {/* Error */}
        {error ? (
          <Text style={[styles.errorText, { color: secondary }]}>
            {error}
          </Text>
        ) : null}

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: textColor }]}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
            placeholder="ejemplo@dominio.com"
            placeholderTextColor={primary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { color: textColor }]}>Contraseña</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
            placeholder="********"
            placeholderTextColor={primary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Botón de login */}
        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={background} />
          ) : (
            <Text style={[styles.buttonText, { color: background }]}>Iniciar sesión</Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 296,
    height: 296,
    //borderRadius: 148,
    //borderWidth: 1,
    borderColor: '#4CAF50',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
