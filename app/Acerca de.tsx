import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, SafeAreaView } from 'react-native';

import ScreenInfoConfig from '@/components/ScreenInfoConfig';

export default function ModalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenInfoConfig />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

