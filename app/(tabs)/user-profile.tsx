// En: app/(tabs)/user-profile.tsx

import { ButtonWithIcon } from '@/components/ButtonWithIcon';
import { deleteUser, getSession, signOut } from '@/services/auth'; // Importa tu función de logout
import { useFocusEffect } from 'expo-router';
import moment from 'moment';
import 'moment/locale/es';
import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
export default function UserProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [dataUser, setDataUser] = useState<any>();
  const [dateUser, setDateUser] = useState<any>();

  const [emailUser, setEmailUser] = useState<any>();
  var userData: any = []
  const handleLogout = async () => {
    await signOut();
  };


  const handleDeleteAcount = async () => {
    await deleteUser(userData.id);
  };

  const handleSaveAcount = async () => {
    await signOut();
  };


  const getUserdata = async () => {
    setLoading(true); // <-- Inicia la carga CADA VEZ que se llama
    try {
      const { session } = await getSession();
      var userData = session?.user;
      console.log(userData)
      setDataUser(userData)
      const date = moment(userData?.created_at);
      const formattedDate2 = date.format('DD/MM/YYYY');
      setEmailUser(userData?.email)
      setDateUser(formattedDate2)

    } catch (error) {
      console.error('Error al obtener playlists:', error);
    } finally {
      setLoading(false);
    }
  }


  useFocusEffect(
    useCallback(() => {
      getUserdata();
      return () => {
      };
    }, []) // El array vacío es obligatorio para useCallback
  );

  const showProfile = async () => {

  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.navContainer}>
        <View>
          <View style={styles.navItem}>
            <Image
              style={styles.userLogoImage}
              source={require('./../../assets/images/user-default-image.png')}
            />
            <Text style={styles.text}>{emailUser}</Text>
          </View>
          <View style={styles.navItem}>
            <ButtonWithIcon
              title="Detalles Perfil"
              onPress={showProfile}
              iconName="person"
            />
          </View>
        </View>
        {/* 2. Grupo Inferior (Botón de Salir) */}
        <View style={styles.navItem}>
          <ButtonWithIcon
            title="Cerrar sesión"
            variant='menu'
            onPress={handleLogout}
            iconName="log-out"
          />
        </View>
      </View>

      {/* --- CONTENIDO PRINCIPAL CORREGIDO --- */}
      <View style={styles.container}>
        <View style={styles.intoContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Detalles Perfil</Text>
            {/* <ButtonWithIcon
              title="Guardar cambios"
              onPress={handleSaveAcount}
            /> */}
          </View>
          <View style={styles.separator}></View>
          <Text style={styles.text}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#888"
            keyboardType="email-address"
            value={emailUser} // Asumo que 'emailUser' es un estado
            autoCapitalize="none"
          />
          <View style={styles.separator}></View>
          <Text style={styles.text}>Fecha Creación: {dateUser}</Text>
        </View>
        {/* Tarjeta de Zona Peligrosa */}
        <View style={styles.intoContainer}>
          <Text style={styles.title}>Zona Peligrosa</Text>
          <View style={styles.separator}></View>
          <Text style={styles.title}>Eliminación de cuenta</Text>
          <Text style={styles.text}>Se eliminará su sesión y toda su información relacionada</Text>
          <ButtonWithIcon
            title="Eliminar cuenta"
            variant='danger'
            onPress={handleDeleteAcount}
          />
        </View>
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#161022',
    flex: 1,
    flexDirection: 'row',
  },
  userLogoImage: {
    width: 30,
    height: 30,
  },

  navContainer: {
    backgroundColor: '#161022',
    paddingVertical: 30,
    paddingHorizontal: 12,
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: 250,
  },
  navItem: {
    width: '100%', // Asegura que los items ocupen todo el ancho
    alignItems: 'center', // Centra el texto y el botón
    paddingVertical: 10,
  },

  // --- ESTILOS DE CONTENIDO PRINCIPAL ---
  container: {
    flex: 5, // <-- CLAVE: Ocupa el resto del espacio (5 veces más que la nav)
    padding: 24,
    backgroundColor: '#161022',
    alignItems: 'center', // Centra las tarjetas horizontalmente
  },

  // --- ESTILOS DE TARJETA REACTIVA ---
  intoContainer: {
    padding: 24,
    borderWidth: 1, // Añadí esto para que se vea el borde
    borderRadius: 10,
    backgroundColor: '#1c142c', // Un morado más oscuro que el borde
    marginVertical: 10,
    width: '100%', // <-- CLAVE: Ocupa el ancho del contenedor
    maxWidth: 800, // <-- CLAVE: Tamaño máximo para pantallas grandes
  },

  // Contenedor para alinear Título y Botón
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22, // Un poco más pequeño para que quepa
    fontWeight: 'bold',
    color: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#2f2348',
    marginVertical: 10,
  },
  input: {
    height: 50,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    fontSize: 16,
    paddingHorizontal: 10,
    color: '#000', // Texto del input en negro
    marginTop: 5,
  },
});