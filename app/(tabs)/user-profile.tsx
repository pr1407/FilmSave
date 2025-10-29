// En: app/(tabs)/user-profile.tsx

import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';
import { signOut } from '@/services/auth'; // Importa tu función de logout

export default function UserProfileScreen() {

  const handleLogout = async () => {
    await signOut();
    // El _layout.tsx se encargará de redirigir a /login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      <Text style={styles.text}>Hola, esta es tu página de perfil.</Text>
      
      {/* Puedes mover el botón de logout de la barra superior aquí si prefieres */}
      <Button
        title="Cerrar Sesión"
        onPress={handleLogout}
        color="#FF3B30"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 40,
  },
});