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

      <View style={styles.containerModule}>
        <Image
          source={require('../../assets/images/icon.png')} // Ajusta la ruta a tu logo
          style={styles.logo}
        />
        <Text style={styles.title}>Bienvenido a FilmSave</Text>
        <Text style={styles.subtitle}>Inicie sesion para continuar registrando sus playlist</Text>
      </View>
      <View style={styles.modalContainer}>
        <View  >
          <Text style={styles.subtitleInput}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#888"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>
        <View >
          <Text style={styles.subtitleInput}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

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

      </View>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push('/(auth)/signup')}
        disabled={loading}
      >
        <Text >
          ¿No tienes cuenta? <Text style={styles.secondaryButtonText}>Regístrate</Text>
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
    backgroundColor: '#f3f4f6', // Fondo blanco limpio
  },

  containerModule: {
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20// Fondo blanco limpio
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
    textAlign: 'center',
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#6b7280',
  },

  subtitleInput: {
    fontSize: 16,
    color: '#374151',
    paddingBottom: 10,
  },

  input: {
    height: 50,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9fafb', // Ligero color de fondo
    fontSize: 16,

  },
  // Estilo para el botón primario
  button: {
    backgroundColor: '#6366f1', // Color azul primario
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
    color: '#6366f1',
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalContainer: {
    backgroundColor: '#ffffff', // Color azul primario
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 12,
  }
});