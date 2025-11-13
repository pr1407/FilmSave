import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { createPlaylistInvite, getPermisos } from '@/services/api';

export default function CompartirPlaylistModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [email, setEmail] = useState('');
  const [permiso, setPermiso] = useState<number | null>(null);
  const [permisos, setPermisos] = useState<any[]>([]);
  const [linkGenerado, setLinkGenerado] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPermisos = async () => {
      const data = await getPermisos();
      setPermisos(data);
      if (data.length > 0) setPermiso(data[0].id);
    };
    loadPermisos();
  }, []);

  const handleGenerateLink = async () => {

    console.log("Generando link para playlist ID:", id, "con email:", email, "y permiso:", permiso);
    console.log(email.trim());

    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico.');
      console.log('Error Por favor ingresa un correo electrónico.');
      return;
    }
    if (!permiso) {
      Alert.alert('Error', 'Selecciona un tipo de permiso.');
      console.log('Selecciona un tipo de permiso.');
      return;
    }

    console.log('aca vamos a generar el link');

    setLoading(true);
    const { success, url, error } = await createPlaylistInvite(Number(id), email, permiso);
    setLoading(false);

    console.log('antes del if');
    console.log('success', success);
    console.log('success', success);

    console.log('url', url);

    if (success && url) {
      setLinkGenerado(url);
      try {
        if (Platform.OS === 'web') {
          await navigator.clipboard.writeText(url);
          console.log('Enlace copiado al portapapeles (web)');
        } else {
          await Clipboard.setStringAsync(url);
          console.log('Enlace copiado en app');

        }

        Alert.alert(
          '¡Enlace Generado!',
          'El enlace se copió automáticamente a tu portapapeles ✅'
        );

      } catch (e) {
        console.error('Error al copiar automáticamente:', e);
        Alert.alert(
          'Enlace Generado',
          'No se pudo copiar al portapapeles, pero aquí lo tienes.'
        );
      }
    } else {
      Alert.alert('Error', error || 'No se pudo generar el enlace de invitación.');
    }
  };

  const handleCopyLink = async () => {
    if (!linkGenerado) return;
    await Clipboard.setStringAsync(linkGenerado);
    Alert.alert('Copiado', 'Enlace copiado al portapapeles ✅');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invita a otros usuarios para ver o editar esta playlist.</Text>
      <Text style={styles.label}>Correo del colaborador</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Permiso</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={permiso}
          onValueChange={(value) => setPermiso(value)}
          style={styles.picker}
        >
          {permisos.map((p) => (
            <Picker.Item key={p.id} label={p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1)} value={p.id} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleGenerateLink}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Generando...' : 'Generar enlace'}
        </Text>
      </TouchableOpacity>

      {linkGenerado ? (
        <View style={styles.linkBox}>
          <Text style={styles.linkText} numberOfLines={1}>
            {linkGenerado}
          </Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
            <Text style={styles.copyButtonText}>Copiar enlace</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, styles.closeButton]}
        onPress={() => router.back()}
      >
        <Text style={[styles.buttonText, { color: '#fff' }]}>Cerrar</Text>
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
  subtitle: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#2f2348',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  picker: {
    height: 48,
    width: '100%',
    backgroundColor: '#2f2348',
    color: '#8171a3',
    borderRadius: 8,
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
  linkBox: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#563d61ff',
    padding: 12,
    borderRadius: 8,
  },
  linkText: {
    color: '#014de1',
    textAlign: 'center',
    marginBottom: 8,
  },
  copyButton: {
    backgroundColor: '#252c7a',
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#563d61ff',
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2,
    marginTop: 10,
  },

});
