import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Session } from '@supabase/supabase-js';
import 'react-native-get-random-values';
import { useColorScheme } from '@/components/useColorScheme';
import { getSession, supabase, signOut } from '../services/auth';
import { TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };

  // Tu lógica de sesión y redirección está PERFECTA.
  // No necesita cambios.
  useEffect(() => {
    const fetchSession = async () => {
      const { session: currentSession, error } = await getSession();
      setSession(currentSession);
      setLoading(false);
    };
    fetchSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, loading, segments, router]);


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        // Tu navbar global está PERFECTO.
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: '#1C1C1E' },
          headerTintColor: '#FFFFFF',
          headerTitleAlign: 'center',
          headerTitle: () => (
            <Image
              source={require('../assets/images/icon.png')}
              style={{ width: 120, height: 30, resizeMode: 'contain' }}
            />
          ),
          headerRight: () => (
            session ? (
              <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
                <Ionicons name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            ) : null
          ),
        }}
      >
        {/* --- 👇 AQUÍ ESTÁ LA CORRECCIÓN --- */}
        {/*
          Define los GRUPOS (las carpetas), no los archivos dentro de ellos.
          Las opciones aquí anulan el 'screenOptions' global para todo el grupo.
        */}
        <Stack.Screen
          name="(tabs)" // El grupo de tus pestañas principales
          options={{ headerShown: false }} // Oculta el navbar en (tabs)
        />
        <Stack.Screen
          name="(auth)" // El grupo de login/signup
          options={{ headerShown: false }} // Oculta el navbar en auth
        />
        <Stack.Screen
          name="(modals)" // El grupo de modales
          options={{
            presentation: 'modal',
            // Opcional: si quieres que los modales tengan el navbar:
            // title: 'Modal', 

            // Opcional: si quieres que NO tengan navbar:
            headerShown: false,
          }}
        />

        <Stack.Screen name="playlist/[id]" />
        <Stack.Screen name="invite/[id]" />


      </Stack>
    </ThemeProvider>
  );
}