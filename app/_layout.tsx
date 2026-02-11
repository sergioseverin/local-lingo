import { initializeAdMob } from '@/utils/adMobUtils';
import { initializeTikTok, trackInstall, trackLaunch } from '@/utils/tiktokUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize AdMob and TikTok on app startup
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAdMob();
        console.log('✅ AdMob ready for use');
        
        // Initialize TikTok Business SDK
        await initializeTikTok();
        
        // Check if this is first app launch (install tracking)
        const hasTrackedInstall = await AsyncStorage.getItem('tiktok_install_tracked');
        if (!hasTrackedInstall) {
          await trackInstall();
          await AsyncStorage.setItem('tiktok_install_tracked', 'true');
          console.log('📥 First launch - install event tracked');
        }
        
        // Track app launch
        await trackLaunch();
      } catch (error) {
        console.error('❌ Failed to initialize app services:', error);
      }
    };

    init();
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
