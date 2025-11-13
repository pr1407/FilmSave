import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Alert,
    TouchableOpacity, // 👈 Importar Alert para los mensajes
} from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router'; // 👈 Importar useRouter
import {
    TextField,
    Button,
    List, // 'Link' de MUI no se usa, usamos el de expo-router
    ListItem,
    ListItemText,
    Card,
    CardMedia,
    CardContent,
    Paper,
} from '@mui/material';
import {
    searchMovies,
    getPlaylistByShareLink,
    getMoviesInPlaylist,
    getMovieByImdbId,
    addMovie,
    addMovieToPlaylist,
    updateMovieStatus,
    deleteMovieFromPlaylist,
    validatePermission
} from '@/services/api';
// 👈 Importar funciones de auth
import { getSession } from '@/services/auth';
import { Ionicons } from '@expo/vector-icons';


export default function PlaylistDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter(); // 👈 Hook para redirigir

    const [playlist, setPlaylist] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [movies, setMovies] = useState<any[]>([]);

    // 👇 Estado para guardar el permiso
    const [permission, setPermission] = useState<any | false>(false);

    useEffect(() => {
        // 1. Renombramos la función a una que valide y luego cargue
        const checkAccessAndFetchData = async () => {
            setLoading(true);
            const shareId = Array.isArray(id) ? id[0] : (id as string);

            try {
                // 2. Obtener el usuario actual
                const { session } = await getSession();
                const userId = session?.user?.id;
                if (!userId) {
                    throw new Error('No hay sesión de usuario.');
                }

                // 3. Obtener la playlist por el link de compartir
                const { data: playlistData, error: playlistError } = await getPlaylistByShareLink(shareId);

                if (playlistError || !playlistData) {
                    throw new Error('Playlist no encontrada o el enlace es inválido.');
                }

                if (playlistData.creador_id === userId) {
                    setPermission('owner');
                } else {
                    const collabPermission = await validatePermission(userId, playlistData.id);
                    if (collabPermission) {
                        setPermission(collabPermission);
                    } else {
                        throw new Error('No tienes permiso para ver esta playlist.');
                    }
                }

                // --- 5. SI TIENE PERMISO, CONTINUAR CARGANDO ---
                setPlaylist(playlistData);

                // Cargar las películas de la lista
                const { data: moviesData } = await getMoviesInPlaylist(playlistData.id);
                setMovies(moviesData || []);

            } catch (error: any) {
                Alert.alert(
                    'Acceso Denegado',
                    error.message || 'No se pudo cargar la playlist.'
                );
                router.replace('/(tabs)'); // 👈 Redirigir al inicio
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            checkAccessAndFetchData();
        }
    }, [id, router]); // 👈 Añadir router a las dependencias

    // 🔍 Buscar películas (sin cambios)
    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.length < 3) {
            setResults([]);
            return;
        }
        const movies = await searchMovies(text);
        setResults(movies);
    };

    // ➕ Agregar película (sin cambios)
    const handleAdd = async (movie: any) => {
        // ... (lógica existente sin cambios)
        const alreadyInList = movies.some(
            (m) => m.peliculas.imdb_id === movie.imdbID
        );
        if (alreadyInList) {
            alert('Esta película ya está en la lista 🎬');
            setResults([]);
            setQuery('');
            return;
        }
        const { data: existing } = await getMovieByImdbId(movie.imdbID);
        let imdbId = movie.imdbID;
        if (!existing) await addMovie(movie);
        await addMovieToPlaylist(playlist.id, imdbId);
        const newMovie = {
            pelicula_imdb_id: imdbId,
            status: false,
            peliculas: {
                imdb_id: imdbId,
                titulo: movie.Title,
                ano: movie.Year,
                poster_url: movie.Poster,
            },
        };
        setMovies((prev) => [...prev, newMovie]);
        setResults([]);
        setQuery('');
    };

    // ✅ Cambiar estado (sin cambios)
    const handleToggleStatus = async (imdbId: string, status: boolean) => {
        try {
            const newStatus = !status;
            const { error } = await updateMovieStatus(playlist.id, imdbId, newStatus);
            if (error) throw error;
            setMovies((prevMovies) =>
                prevMovies.map((m) =>
                    m.peliculas.imdb_id === imdbId ? { ...m, status: newStatus } : m
                )
            );
        } catch (err) {
            console.error('Error en toggle status:', err);
        }
    };

    const handleDelete = async (imdbId: string) => {
        await deleteMovieFromPlaylist(playlist.id, imdbId);
        setMovies((prev) => prev.filter((m) => m.peliculas.imdb_id !== imdbId));
    };


    // --- RENDERIZADO ---

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text>Verificando permisos...</Text>
            </View>
        );
    }

    // 👇 Si no está cargando y no hay permiso, no renderizar nada
    // (El usuario ya habrá sido redirigido por el useEffect)
    if (!permission) {
        return null;
    }

    // 👇 Esta es la parte que NO funcionará en React Native
    return (
        <View style={styles.wrapper}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
                <Text style={styles.title}>Playlist: {playlist?.nombre}</Text>
                <Text style={styles.subtitleText}>{playlist?.descripcion}</Text>
                <Text style={styles.subtitleText}>Agrega nuevas peliculas</Text>

                <View style={styles.separator}></View>

                <View style={styles.buttonsRow}>
                    {(permission === 'owner' || permission === 2) && (
                        <View style={styles.searchWrapper}>
                            <TextField
                                label="Buscar peliculas para agregar"
                                value={query}
                                color="secondary"
                                onChange={(e) => handleSearch(e.target.value)}
                                fullWidth
                                margin="normal"
                                sx={{
                                    backgroundColor: '#2f2348', // CSS simple
                                    borderRadius: 2, // Accede al theme.spacing (1 * 8px = 8px)
                                    '& .MuiInputLabel-root': {
                                        color: '#8171a3', // Color del label en estado normal
                                        fontSize: '0.9rem',
                                    },
                                }}
                            />
                            {results.length > 0 && (
                                <Paper elevation={3} style={styles.resultsOverlay}>
                                    <ScrollView style={styles.resultsScroll}>
                                        <List>
                                            {results.map((movie: any) => (
                                                <ListItem
                                                    key={movie.imdbID}
                                                    button
                                                    onClick={() => handleAdd(movie)}
                                                >
                                                    <img src={movie.Poster} width={40} />
                                                    <ListItemText
                                                        primary={movie.Title}
                                                        secondary={movie.Year}

                                                        // Estilos para el texto principal (movie.Title)
                                                        primaryTypographyProps={{
                                                            sx: {
                                                                paddingLeft: 2,
                                                                color: '#ffffff', // Color blanco
                                                                fontWeight: 'bold',
                                                                fontSize: '0.9rem',
                                                            }
                                                        }}

                                                        // Estilos para el texto secundario (movie.Year)
                                                        secondaryTypographyProps={{
                                                            sx: {
                                                                paddingLeft: 2,
                                                                color: '#b0bec5', // Un gris claro
                                                                fontSize: '0.8rem',
                                                            }
                                                        }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </ScrollView>
                                </Paper>
                            )}
                        </View>
                    )}

                    {(permission === 'owner' || permission === 2) && (
                        <Link href={`/(modals)/compartir-playlist-modal?id=${playlist.id}`} asChild>
                            <TouchableOpacity
                                style={
                                    styles.shareButton
                                }>
                                <Ionicons
                                    name={'share'}
                                    size={18}
                                />
                                <Text style={styles.textBaseShare}>Compartir</Text>
                            </TouchableOpacity>
                        </Link>
                    )}
                </View>

                <Text style={styles.title}>🎬 Películas en esta Playlist</Text>

                <View style={styles.grid}>
                    {movies.map((movie: any) => (
                        <Card
                            key={movie.peliculas.imdb_id}
                            style={styles.card}
                            sx={{
                                /* ... (tus estilos sx) ... */
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="300"
                                image={movie.peliculas.poster_url || '/placeholder.png'}
                                alt={movie.peliculas.titulo}
                            />

                            <CardContent style={styles.cardContent}>
                                <View style={styles.titleRow}>
                                    <Text style={styles.movieTitle}>{movie.peliculas.titulo}</Text>
                                    <Text style={styles.movieYear}>{movie.peliculas.ano}</Text>
                                </View>


                                <View style={styles.buttons}>
                                    {(permission === 'owner' || permission === 2) && (
                                        <TouchableOpacity
                                            // Estilos condicionales
                                            style={[
                                                styles.buttonBase,
                                                movie.status ? styles.buttonSuccess : styles.buttonPrimary
                                            ]}
                                            onPress={() =>
                                                handleToggleStatus(movie.peliculas.imdb_id, movie.status)
                                            }
                                        >
                                            <Ionicons
                                                name={movie.status ? 'eye' : 'eye-off'}
                                                size={18}
                                                color={movie.status ? styles.textSuccess.color : styles.textPrimary.color}
                                            />
                                            <Text
                                                style={[
                                                    styles.textBase,
                                                    movie.status ? styles.textSuccess : styles.textPrimary
                                                ]}
                                            >
                                                {movie.status ? ' Vista' : ' No vista'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* --- Botón de Eliminar --- */}
                                    {(permission === 'owner' || permission === 2) && (
                                        <TouchableOpacity
                                            style={[styles.buttonBase, styles.buttonError]}
                                            onPress={() => handleDelete(movie.peliculas.imdb_id)}
                                        >
                                            {/* Añadí un icono para consistencia */}
                                            <Ionicons
                                                name="trash-outline"
                                                size={18}
                                                color={styles.textError.color}
                                            />
                                            <Text style={[styles.textBase, styles.textError]}>
                                                {' Eliminar'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </CardContent>
                        </Card>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
const primaryColor = '#a18fc5';
const successColor = '#a18fc5';
const errorColor = '#a18fc5';
// ... (tus estilos de StyleSheet)
const styles = StyleSheet.create({
    // ... (todos tus estilos existentes)
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

});