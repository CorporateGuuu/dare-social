import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as AV from 'expo-av';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ensureSignedIn, registerUserProfile } from '../src/lib/firebase';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function init() {
      const user = await ensureSignedIn();
      await registerUserProfile(user);

      // Request microphone permission for voice messages
      const { status } = await AV.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Microphone permission denied!');
      }
    }
    init();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
