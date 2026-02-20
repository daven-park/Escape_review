import Ionicons from '@expo/vector-icons/Ionicons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync().catch(() => {
  return;
});

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      return;
    }

    SplashScreen.hideAsync().catch(() => {
      return;
    });
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="store/[id]" options={{ title: '매장 상세' }} />
        <Stack.Screen name="theme/[id]" options={{ title: '테마 상세' }} />
        <Stack.Screen name="review/[id]" options={{ title: '리뷰 작성' }} />
      </Stack>
    </QueryClientProvider>
  );
}
