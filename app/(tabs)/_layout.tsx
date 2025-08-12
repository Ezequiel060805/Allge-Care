import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, Image, ActivityIndicator } from 'react-native';
import { View, Text } from '../../components/Themed';
import LoginScreen from '../LoginScreen';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

import * as SecureStore from 'expo-secure-store';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}



export default function TabLayout() {
  const [isLogged, setIsLogged] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('userToken');
      setIsLogged(!!token);
    })();
  }, []);

  if (isLogged === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Si no está logueado, mostramos la pantalla de login
  if (!isLogged) {
    return <LoginScreen onLoginSuccess={() => setIsLogged(true)} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          title: '',
          headerLeft: () => (
            <Image
              source={require('../../assets/images/iconosComponentes/1.png')}
              style={{ width: 100, height: 100, marginLeft: 8 }}
            />
          ),
          headerRight: () => (
            <Link href="/Acerca de" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="navicon"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 24, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: '',
          headerLeft: () => (
            <Image
              source={require('../../assets/images/iconosComponentes/1.png')}
              style={{ width: 100, height: 100, marginLeft: 8 }}
            />
          ),
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="three"
        options={{
          title: '',
          headerLeft: () => (
            <Image
              source={require('../../assets/images/iconosComponentes/1.png')}
              style={{ width: 100, height: 100, marginLeft: 8 }}
            />
          ),
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
