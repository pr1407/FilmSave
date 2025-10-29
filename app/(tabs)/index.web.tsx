import { getUserPlaylists } from '@/services/api';
import { getSession } from '@/services/auth';
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
  [`& .MuiLinearProgress-bar`]: {
    borderRadius: 5,
    backgroundColor: '#1a90ff',
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
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation(); // Evita que se abra la playlist
                handleCopyLink(item.enlace_compartir);
              }}
            >
              Compartir
            </Button>
          </CardActions>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <Text>Cargando tus playlists...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Tus 🎬 Playlists</Text>
          <Link href="/(modals)/create-list-modal" asChild>
            <Button variant="contained">Nueva Lista</Button>
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
