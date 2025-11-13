import { getUserPlaylists } from '@/services/api';
import { getSession } from '@/services/auth';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  LinearProgress,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as Clipboard from 'expo-clipboard';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: primaryColor,
  [`& .MuiLinearProgress-bar`]: {
    borderRadius: 5,
    backgroundColor: '#3e355b',
  },
}));

const handleCopyLink = async (playlistId: string) => {
  try {
    const link = process.env.EXPO_PUBLIC_URLSERVICE + playlistId;

    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(link);
      window.alert('📋 Enlace copiado al portapapeles');
    } else {
      await Clipboard.setStringAsync(link);
      Alert.alert('Copiado', 'El enlace ha sido copiado al portapapeles.');
    }
  } catch (error) {
    console.error('Error al copiar el enlace:', error);
    Alert.alert('Error', 'No se pudo copiar el enlace.');
  }
};

export default function IndexScreen() {
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [numColumns, setNumColumns] = useState(3);
  const router = useRouter();

  // Detectar tamaño de pantalla dinámicamente
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width > 1100) setNumColumns(3);
      else if (width > 700) setNumColumns(2);
      else setNumColumns(1);
    };

    handleResize(); // inicial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const Item = ({ item }: any) => {
    const progress = item.movies > 0 ? (item.watched / item.movies) * 100 : 0;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/playlist/${item.enlace_compartir}`)}
        style={{ flex: 1 }}
      >
        <Card
          sx={{
            margin: 2,
            borderRadius: 3,
            backgroundColor: 'white',
            borderWidth: 3,
            borderColor: primaryColor,
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {item.description || 'Sin descripción'}
            </Typography>
            <Text style={styles.movieInfo}>
              🎞 {item.movies} películas • 👁 {item.watched} vistas
            </Text>
            <BorderLinearProgress variant="determinate" value={progress} />
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            {/* <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation(); // Evita que se abra la playlist
                handleCopyLink(item.enlace_compartir);
              }}
            >
              Compartir
            </Button> */}



            <TouchableOpacity
              style={[styles.button]}
              onPress={(e) => {
                e.stopPropagation(); // Evita que se abra la playlist
                handleCopyLink(item.enlace_compartir);
              }}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Compartir</Text>
            </TouchableOpacity>

          </CardActions>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <Text style={styles.label}>Cargando tus playlists...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: '#161022' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>FilmSave </Text>
          <Link href="/(modals)/create-list-modal" asChild>

            <TouchableOpacity
              style={
                styles.shareButton
              }>
              <Ionicons
                name={'add'}
                size={18}
                color={'#ffffff'}
              />
              <Text style={styles.textBaseShare}>Crear nueva lista</Text>
            </TouchableOpacity>

          </Link>
        </View>
        <Text style={styles.title}>Mis Playlist de peliculas </Text>
        <Text style={styles.subtitleText}>Crea y maneja tus colecciones personales de peliculas</Text>

        {playlist.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ color: '#777', fontSize: 16 }}>
              Aún no tienes playlists creadas.
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlist}
            key={numColumns}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            renderItem={({ item }) => <Item item={item} />}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const primaryColor = '#a18fc5';
const successColor = '#a18fc5';
const errorColor = '#a18fc5';
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#161022',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
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
    label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
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
  wrapper: {
    flex: 1,
    backgroundColor: '#161022',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitleText: {
    fontSize: 16,
    color: '#a18fc5',
    marginBottom: 20
  },
  searchWrapper:
  {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
  resultsOverlay: {
    position: 'absolute',  // Flota sobre el contenido
    top: '100%',           // Se pone justo debajo del buscador
    left: 0,
    right: 0,
    zIndex: 100,            // Se asegura de estar por encima de otros elementos
    marginTop: 8,      // Un pequeño espacio
    backgroundColor: '#2f2348', // Mismo color del buscador
    color: 'white',

  },
  resultsScroll: {
    maxHeight: 300,
    overflowY: 'auto',
    backgroundColor: '#2f2348',
    color: '#fff'
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  card: {
    width: 260,
    borderRadius: 20,
    backgroundColor: '#161022',
  },
  cardContent: {
    padding: 12,
  },
  titleRow: {
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    color: '#ffffff'

  },
  movieYear: {
    fontSize: 14,
    color: '#666',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,

  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between', // O 'space-around', o usa 'gap'
    marginTop: 10,
  },

  // --- Estilos Base del Botón (simula outlined/small) ---
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 5, // Simula size="small"
    paddingHorizontal: 10, // Simula size="small"
    minWidth: 100, // Asegura que los botones tengan un ancho similar
  },

  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingVertical: 10, // Simula size="small"
    paddingHorizontal: 12, // Simula size="small"
    minWidth: 100, // Asegura que los botones tengan un ancho similar
    backgroundColor: '#5b13ec',
  },

  textBaseShare: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6, // Espacio entre icono y texto
    color: '#ffffff',

  },

  textBase: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6, // Espacio entre icono y texto
  },

  // --- Estilos 'Primary' (No Vista) ---
  buttonPrimary: {
    borderColor: primaryColor,
  },
  textPrimary: {
    color: primaryColor,
  },

  // --- Estilos 'Success' (Vista) ---
  buttonSuccess: {
    borderColor: successColor,
  },
  textSuccess: {
    color: successColor,
  },

  // --- Estilos 'Error' (Eliminar) ---
  buttonError: {
    borderColor: errorColor,
  },
  textError: {
    color: errorColor,
  },


  separator: {
    height: 1, // Thickness of the line
    width: '100%', // Full width
    backgroundColor: '#2f2348', // Color of the line
    marginVertical: 10, // Adjust vertical spacing as needed
  },

    buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
    button: {
    backgroundColor: '#563d61ff',
    padding: 10,
    
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});
