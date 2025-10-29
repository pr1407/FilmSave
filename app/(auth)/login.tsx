import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity, // Importado
  Pressable, // Importado
  ActivityIndicator, // Importado
  Image, // Importado
} from 'react-native';
import { signInWithEmail } from '../../services/auth';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Error de Login', error.message);
    }
    // No necesitas 'else if (session)'.
    // Tu _layout.tsx ya está escuchando el cambio de sesión
    // y te redirigirá automáticamente.
  };

  return (
    <View style={styles.container}>
      {/* Puedes poner tu logo aquí */}
      <Image 
        source={require('../../assets/images/icon.png')} // Ajusta la ruta a tu logo
        style={styles.logo}
      />
      
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />

      {/* Botón primario mejorado */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Botón secundario mejorado */}
      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push('/(auth)/signup')}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff', // Fondo blanco limpio
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#111',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9', // Ligero color de fondo
    fontSize: 16,
  },
  // Estilo para el botón primario
  button: {
    backgroundColor: '#007AFF', // Color azul primario
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilo para el botón secundario (enlace)
  secondaryButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});