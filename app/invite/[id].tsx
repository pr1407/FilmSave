import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Button, CircularProgress, Paper, Typography } from '@mui/material';
import { getPlaylistInvite, acceptPlaylistInvite } from '@/services/api';
import { supabase } from '@/services/supabase';

export default function InvitePage() {
  const { id } = useLocalSearchParams();
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchInvite = async () => {
      const userRes = await supabase.auth.getUser();
      setUser(userRes.data.user);
      const data = await getPlaylistInvite(id as string);
      setInvite(data);
      setLoading(false);
    };
    fetchInvite();
  }, [id]);

  const handleAccept = async () => {
    if (!user) {
      alert('Debes iniciar sesión para aceptar la invitación.');
      return;
    }
    await acceptPlaylistInvite(id as string, user.id);
    alert('✅ Invitación aceptada. Ya puedes acceder a la playlist.');
  };

  if (loading)
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <CircularProgress />
      </div>
    );

  if (!invite)
    return (
      <Typography variant="h6" color="error" align="center">
        Invitación no válida o expirada.
      </Typography>
    );

  return (
    <Paper
      elevation={3}
      style={{
        margin: '5% auto',
        padding: 30,
        maxWidth: 500,
        textAlign: 'center',
        borderRadius: 12,
      }}
    >
      <Typography variant="h5">🎬 Invitación a colaborar</Typography>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Has sido invitado a <strong>{invite.playlists.nombre}</strong>
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Permiso: <strong>{invite.permisos.nombre}</strong>
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleAccept}
        sx={{ mt: 3 }}
      >
        Aceptar invitación
      </Button>
    </Paper>
  );
}
