import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
// ¡Importa signUpWithEmail!
import { signUpWithEmail } from '../../services/auth'; 
import { router } from 'expo-router';

export default function SignUpScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // ¡Función corregida para registrarse!
  const handleSignUp = async () => {
    // 1. Validar contraseñas
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    // 2. Validar campos vacíos
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    // 3. Llamar a la API de registro
    const { error } = await signUpWithEmail(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Error de Registro', error.message);
    } else {
      // 4. Éxito - Avisar al usuario que revise su email
      Alert.alert(
        '¡Registro Exitoso!',
        'Se ha enviado un correo de confirmación a tu email. Por favor, revísalo para activar tu cuenta.',
        [
          // Botón para ir a login
          { text: 'OK', onPress: () => router.push('/(auth)/login') }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/icon.png')} // Ajusta la ruta a tu logo
        style={styles.logo}
      />
      
      <Text style={styles.title}>Crear Cuenta</Text>
      
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
      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        placeholderTextColor="#888"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
      />

      {/* Botón primario mejorado */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp} // Llama a la función correcta
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrarme</Text>
        )}
      </TouchableOpacity>

      {/* Botón secundario mejorado */}
      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push('/(auth)/login')}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </Pressable>
    </View>
  );
}

// ... (Estilos actualizados abajo)
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