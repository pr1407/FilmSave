import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="create-list-modal" 
        options={{ title: 'Crear Nueva Lista' }} 
      />
      <Stack.Screen 
        name="compartir-playlist-modal" 
        options={{ title: 'Compartir Playlist' }} 
      />
    </Stack>
  );
}