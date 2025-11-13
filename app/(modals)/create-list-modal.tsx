import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { View, Text } from '@/components/Themed';
import { createPlaylist } from '@/services/api';
import { supabase } from '../../services/supabase';

export default function CreateListScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleCreateList = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      Alert.alert('Error', 'Debes iniciar sesión para crear una lista.');
      return;
    }

    const user = session.user;
    if (!nombre.trim() || !descripcion.trim()) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.');
      return;
    }

    const { data, error } = await createPlaylist(nombre, descripcion, user.id);

    if (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo crear la lista.');
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nueva Lista</Text>
      <Text style={styles.label}>Nombre</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la lista"
        value={nombre}
        onChangeText={setNombre}
      />
      <Text style={styles.label}>Descripcion</Text>
      
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateList}
      >
        <Text style={[styles.buttonText, { color: '#fff' }]}>Crear Lista</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#161022',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    height: 48,
    width: '100%',
    borderColor: '#2f2348',
    backgroundColor: '#2f2348',
    color: '#8171a3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#563d61ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
    label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
});
