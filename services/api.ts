import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
const OMDB_API_KEY = process.env.EXPO_PUBLIC_OMDB_KEY;

export const searchMovies = async (query: string) => {
  if (!query || query.length < 3) return []; // evita saturar la API

  const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
  const data = await response.json();

  if (data.Response === 'False') return [];
  return data.Search || [];
};

export const getUserPlaylists = async (userId: string) => {
  try {
    // La consulta que necesitamos para ambas
    const selectQuery = `
      id,
      nombre,
      descripcion,
      enlace_compartir,
      creador_id,
      playlist_peliculas (
        status
      )
    `;

    // --- 1. Obtener playlists PROPIAS ---
    const { data: ownedData, error: ownedError } = await supabase
      .from('playlists')
      .select(selectQuery) // Solo las columnas que necesitamos
      .eq('creador_id', userId);

    if (ownedError) throw ownedError; // Lanza el error si falla

    // --- 2. Obtener playlists COMPARTIDAS ---
    const { data: sharedData, error: sharedError } = await supabase
      .from('playlists')
      .select(`
        ${selectQuery},
        playlist_colaboradores!inner(usuario_id)
      `)
      // !inner asegura que solo traiga playlists que *tengan* un colaborador
      .eq('playlist_colaboradores.usuario_id', userId) // Filtra por ese colaborador
      .neq('creador_id', userId); // Opcional: para no traer las propias otra vez

    if (sharedError) throw sharedError; // Lanza el error si falla

    // --- 3. Combinar y Mapear los resultados ---

    // Usamos un Map para eliminar duplicados si los hubiera
    const uniquePlaylists = new Map<string, any>();

    [...ownedData, ...sharedData].forEach((p) => {
      uniquePlaylists.set(p.id, p);
    });
    
    // Convertimos el Map de nuevo a un array
    const allData = Array.from(uniquePlaylists.values());
    
    // Tu lógica de mapeo (sigue siendo perfecta)
    const playlists = allData.map((p: any) => {
      const totalMovies = p.playlist_peliculas?.length || 0;
      const watchedMovies =
        p.playlist_peliculas?.filter((m: any) => m.status === true).length || 0;

      return {
        id: p.id,
        name: p.nombre,
        description: p.descripcion,
        enlace_compartir: p.enlace_compartir,
        movies: totalMovies,
        watched: watchedMovies,
        owner_id: p.creador_id, // La clave para el frontend
      };
    });

    return { data: playlists, error: null };

  } catch (error) {
    console.error('Error fetching all playlists:', error);
    return { data: null, error };
  }
};

export const createPlaylist = async (nombre: string, descripcion: string, creador_id: string) => {

    const enlace_compartir = uuidv4();
    const fecha_creacion = new Date().toISOString();
    const { data, error } = await supabase
        .from('playlists')
        .insert([
            {
                nombre,
                descripcion,
                creador_id,
                enlace_compartir,
                fecha_creacion,
            },
        ])
        .select();

    return { data, error };
};

export const deletePlaylist = async (id: number): Promise<{ data: any | null; error: any }> => {
    const { data, error } = await supabase.from('playlists').delete().eq('id', id);
    return { data, error };
};


export const removeMovieFromPlaylist = async (playlistId: number, movieId: number): Promise<{ data: any | null; error: any }> => {
    const { data, error } = await supabase.from('playlist_peliculas').delete().eq('playlist_id', playlistId).eq('movie_id', movieId);
    return { data, error };
};

export const getMoviesInPlaylist = async (playlistId: number) => {
  const { data, error } = await supabase
    .from('playlist_peliculas')
    .select(`
      status,
      peliculas (
        imdb_id,
        titulo,
        ano,
        poster_url
      )
    `)
    .eq('playlist_id', playlistId);
  return { data, error };
};

export const getPlaylistByShareLink = async (shareLink: string) => {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('enlace_compartir', shareLink)
    .single();
  return { data, error };
};

export const getMovieByImdbId = async (imdbId: string) => {
  const { data, error } = await supabase
    .from('peliculas')
    .select('*')
    .eq('imdb_id', imdbId)
    .single();
  return { data, error };
};

// Inserta una nueva película
export const addMovie = async (movie: any) => {
  const { data, error } = await supabase
    .from('peliculas')
    .insert([
      {
        imdb_id: movie.imdbID,
        titulo: movie.Title,
        ano: movie.Year,
        poster_url: movie.Poster
      }
    ])
    .select()
    .single();
  return { data, error };
};

// Agrega película a playlist
export const addMovieToPlaylist = async (playlistId: number, imdbId: string) => {
  const { data, error } = await supabase
    .from('playlist_peliculas')
    .insert([{ playlist_id: playlistId, pelicula_imdb_id: imdbId, status: false }]);
  return { data, error };
};

// Alterna el status de "vista"
export const toggleMovieStatus = async (playlistId: number, imdbId: string, status: boolean) => {
  const { data, error } = await supabase
    .from('playlist_peliculas')
    .update({ status })
    .eq('playlist_id', playlistId)
    .eq('pelicula_imdb_id', imdbId);
  return { data, error };
};

// Elimina una película de la playlist
export const deleteMovieFromPlaylist = async (playlistId: number, imdbId: string) => {
  const { error } = await supabase
    .from('playlist_peliculas')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('pelicula_imdb_id', imdbId);
  return { error };
};


export const updateMovieStatus = async (playlistId: number, imdbId: string, status: boolean) => {
  return await supabase
    .from('playlist_peliculas')
    .update({ status })
    .eq('playlist_id', playlistId)
    .eq('pelicula_imdb_id', imdbId);
};

export const getPermisos = async () => {
  const { data, error } = await supabase.from('permisos').select('*');

  if (error) {
    console.error('Error al cargar permisos:', error.message);
    return [];
  }

  return data || [];
};

export const createPlaylistInvite = async (
  playlistId: number,
  email: string,
  permisoId: number
) => {
  
  const { data: existingInvite, error: checkError } = await supabase
    .from('playlist_invites')
    .select('id, permiso_id') // 👈 CAMBIO AQUÍ
    .eq('email', email)
    .eq('playlist_id', playlistId)
    .maybeSingle();

  if (checkError) {
    console.error('❌ Error buscando invitación existente:', checkError);
    return { success: false, url: null, error: checkError.message };
  }

  const baseUrl = process.env.EXPO_PUBLIC_URLSERVICE;
  if (!baseUrl) {
    console.error('❌ EXPO_PUBLIC_URLSERVICE no está configurado');
    return { success: false, url: null, error: 'Error de configuración del servidor.' };
  }

  if (existingInvite) {
    
    if (existingInvite.permiso_id !== permisoId) {
      console.log('ℹ️ Invitación existente. Actualizando permiso...');
      
      const { error: updateError } = await supabase
        .from('playlist_invites')
        .update({ permiso_id: permisoId }) // Actualiza al nuevo permiso
        .eq('id', existingInvite.id); // Donde el ID coincida

      if (updateError) {
        console.error('❌ Error actualizando permiso:', updateError);
        return { success: false, url: null, error: updateError.message };
      }
    } else {
      console.log('✅ Invitación existente con permiso idéntico. No se actualiza.');
    }

    const inviteUrl = `${baseUrl}/invite/${existingInvite.id}`;
    return { success: true, url: inviteUrl, error: null };
  }

  console.log('ℹ️ No hay invitación. Creando una nueva...');
  const { data: newInvite, error: insertError } = await supabase
    .from('playlist_invites')
    .insert([
      {
        id: uuidv4(),
        playlist_id: playlistId,
        email,
        permiso_id: permisoId,
      },
    ])
    .select('id')
    .single();

  if (insertError) {
    console.error('❌ Error creando nueva invitación:', insertError);
    return { success: false, url: null, error: insertError.message };
  }

  // Construir la URL con el NUEVO id
  const inviteUrl = `${baseUrl}/invite/${newInvite.id}`;

  return { success: true, url: inviteUrl, error: null };
};
/* 🔍 Obtener datos de una invitación por ID */
export const getPlaylistInvite = async (inviteId: string) => {
  const { data, error } = await supabase
    .from('playlist_invites')
    .select('*, permisos(nombre), playlists(nombre)')
    .eq('id', inviteId)
    .single();

  if (error) {
    console.error('❌ Error obteniendo invitación:', error);
    return null;
  }

  return data;
};

/* ✅ Aceptar una invitación */
export const acceptPlaylistInvite = async (inviteId: string, userId: string) => {
  // 1️⃣ Obtener la invitación
  const { data: invite, error: inviteError } = await supabase
    .from('playlist_invites')
    .select('*')
    .eq('id', inviteId)
    .single();

  if (inviteError || !invite) {
    console.error('❌ Invitación no encontrada');
    throw new Error('Invitación no válida.');
  }

  if (invite.used) {
    throw new Error('Esta invitación ya fue usada.');
  }

  // 2️⃣ Agregar al usuario a la tabla playlist_colaboradores
  const { error: insertError } = await supabase.from('playlist_colaboradores').insert([
    {
      playlist_id: invite.playlist_id,
      usuario_id: userId,
      permiso_id: invite.permiso_id,
    },
  ]);

  if (insertError) {
    console.error('❌ Error agregando colaborador:', insertError);
    throw new Error('No se pudo agregar el colaborador.');
  }

  // 3️⃣ Marcar la invitación como usada
  const { error: updateError } = await supabase
    .from('playlist_invites')
    .update({ used: true })
    .eq('id', inviteId);

  if (updateError) {
    console.warn('⚠️ Error marcando invitación como usada:', updateError);
  }

  return { success: true, playlistId: invite.playlist_id };
};

export const validatePermission = async (userId: string, playlistId: string): Promise<any | false> => {
  if (!userId || !playlistId) return false;

  const { data, error } = await supabase
    .from('playlist_colaboradores')
    .select('permiso_id') // Asumo que tu columna de permiso se llama 'permiso_id'
    .eq('usuario_id', userId) 
    .eq('playlist_id', playlistId) 
    .maybeSingle();

  // 3. Manejo de errores
  if (error) {
    console.error('Error validating permission:', error.message);
    return false;
  }

  return data ? data.permiso_id : false;
};