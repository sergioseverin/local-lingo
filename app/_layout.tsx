import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // TODO: Replace with react-native-google-mobile-ads initialization
  // Initialize AdMob test device for development
  useEffect(() => {
    const initializeAdMob = async () => {
      try {
        // await setTestDeviceIDAsync("EMULATOR");
        console.log('⚠️ AdMob initialization disabled - waiting for react-native-google-mobile-ads migration');
      } catch (error) {
        console.error('❌ Failed to register AdMob test device:', error);
      }
    };

    initializeAdMob();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
