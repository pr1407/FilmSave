import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // O FontAwesome, etc.

export default function TabLayout() {
  return (
    // Esto crea las pestañas en la parte inferior
    <Tabs
      screenOptions={{
        headerShown: false, // Oculta el header *del TabNavigator*
        // tabBarActiveTintColor: 'blue', // Puedes estilizarlo
      }}
    >
      <Tabs.Screen
        name="index" // Apunta a app/(tabs)/index.tsx
        options={{
          title: 'Playlists',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user-profile" // Apunta a app/(tabs)/user-profile.tsx
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}