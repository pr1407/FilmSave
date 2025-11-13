import { getUserPlaylists } from '@/services/api';
import { getSession } from '@/services/auth';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, // Para botones personalizados
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity, // Reemplazo de 'Cargando...'
  useWindowDimensions,
  View
} from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
const { urlService } = Constants.expoConfig.extra;

const PlaylistItemCard = ({ item }: { item: any }) => {
  const router = useRouter();
  const progress = item.movies > 0 ? item.watched / item.movies : 0;

  const handleCopyLink = async (playlistId: string) => {
    try {
      const link = (urlService || '') + playlistId;
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(link);
        alert('📋 Enlace copiado al portapapeles');
      } else {
        await Clipboard.setStringAsync(link);
        Alert.alert('Copiado', 'El enlace ha sido copiado al portapapeles.');
      }
    } catch (error) {
      console.error('Error al copiar el enlace:', error);
      Alert.alert('Error', 'No se pudo copiar el enlace.');
    }
  };

  return (
    <TouchableOpacity
      style={styles.card} // Reemplazo de <Card> y sx
      onPress={() => router.push(`/playlist/${item.enlace_compartir}`)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description || 'Sin descripción'}
        </Text>
        <Text style={styles.movieInfo}>
          🎞 {item.movies} películas • 👁 {item.watched} vistas
        </Text>
        <Progress.Bar
          progress={progress}
          width={null} // null = 100% del contenedor
          height={8}
          borderRadius={4}
          color={'#1a90ff'}
          unfilledColor={'#e0e0e0'}
          borderWidth={0}
        />
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.shareButton} // Reemplazo de <Button> de MUI
          onPress={(e) => {
            e.stopPropagation(); // Evita que se abra la playlist
            handleCopyLink(item.enlace_compartir);
          }}
        >
          <Ionicons name="share-social-outline" size={16} color="#007AFF" />
          <Text style={styles.shareButtonText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// --- Componente Principal de la Pantalla ---
export default function IndexScreen() {
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [numColumns, setNumColumns] = useState(3);

  // Detectar tamaño de pantalla dinámicamente (Forma Nativa)
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (width > 1100) setNumColumns(3); // Web o tablet grande
    else if (width > 700) setNumColumns(2); // Tablet
    else setNumColumns(1); // Móvil
  }, [width]); // Esto está perfecto como está


  // 1. Mueve la lógica de carga a una función reutilizable
  const fetchPlaylists = async () => {
    setLoading(true); // <-- Inicia la carga CADA VEZ que se llama
    try {
      const { session } = await getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setPlaylist([]); 
        return;
      }

      const { data, error } = await getUserPlaylists(userId);
      if (error) throw error;
      setPlaylist(data || []);
    } catch (error) {
      console.error('Error al obtener playlists:', error);
    } finally {
      setLoading(false); 
    }
  };

  // 2. Reemplaza tu 'useEffect' de carga por 'useFocusEffect'
  useFocusEffect(
    useCallback(() => {
      fetchPlaylists();
      return () => {
      };
    }, []) // El array vacío es obligatorio para useCallback
  );

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a90ff" />
          <Text>Cargando tus playlists...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Tus 🎬 Playlists</Text>
          <Link href="/(modals)/create-list-modal" asChild>
            {/* Reemplazo de <Button> de MUI */}
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Nueva Lista</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {playlist.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ color: '#777', fontSize: 16 }}>
              Aún no tienes playlists creadas.
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlist}
            key={numColumns} // Importante para que se re-renderice al cambiar columnas
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            renderItem={({ item }) => <PlaylistItemCard item={item} />}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// --- Hoja de Estilos Nativa ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4', // Fondo de app
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24, // Más grande
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#007AFF', // Color primario
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  loadingContainer: {
    backgroundColor: '#2f2348',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  // Estilos de la Tarjeta Nativa
  card: {
    flex: 1, // Ocupa el espacio de la columna
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    // Sombra nativa (reemplazo de boxShadow)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4, // Sombra para Android
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    minHeight: 34, // 2 líneas aprox
  },
  movieInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  progressText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#007AFF',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 13,
  },
});