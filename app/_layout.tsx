// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import 'react-native-reanimated';
import { useColorScheme } from '../hooks/useColorScheme';
import { auth } from '../firebaseConfig';
import { User } from 'firebase/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setAuthLoaded(true);
        setError(null);
      }, (error) => {
        console.error('Auth error:', error);
        setError(error.message);
        setAuthLoaded(true);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Auth setup error:', error);
      setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
      setAuthLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded && authLoaded) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded, authLoaded]);

  if (!loaded || !authLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6F0FA' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6F0FA', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 10 }}>Bir hata oluştu:</Text>
        <Text style={{ color: '#1E3A8A', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="index" 
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="login" 
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="register" 
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}