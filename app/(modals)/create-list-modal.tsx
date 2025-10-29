import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert } from 'react-native';
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

      <TextInput
        style={styles.input}
        placeholder="Nombre de la lista"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      <Button title="Crear Lista" onPress={handleCreateList} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});
