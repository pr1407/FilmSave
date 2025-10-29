import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    // Esto crea un Stack para login y signup
    // Ocultamos el header porque el layout raíz ya lo maneja
    <Stack screenOptions={{ headerShown: false }} />
    // No necesitas <Stack.Screen> aquí.
    // El Stack encontrará automáticamente 'login.tsx' y 'signup.tsx'
    // como sus hijos.
  );
}