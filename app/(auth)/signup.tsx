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
          { text: 'OK', onPress: () => router.push('/(auth)/login') }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.containerModule}>
        <Image
          source={require('../../assets/images/icon.png')} // Ajusta la ruta a tu logo
          style={styles.logo}
        />
        <Text style={styles.title}>Crear Cuenta</Text>
      </View>

      <View style={styles.modalContainer}>
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
        <Text style={styles.subtitleInput}>Confirmar Contraseña</Text>

        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />

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
      </View>


      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push('/(auth)/login')}
        disabled={loading}
      >
        <Text >
          Ya tienes cuenta? <Text style={styles.secondaryButtonText}>Inicia sesión</Text>
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