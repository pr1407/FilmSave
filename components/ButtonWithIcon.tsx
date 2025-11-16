// En: components/ButtonWithIcon.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle
} from 'react-native';

// --- 1. Definimos las Props ---
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ButtonWithIconProps {
  title: string;

  onPress: (event: GestureResponderEvent) => void;
  variant?: string;
  iconName?: IoniconName; // ¡Ahora es opcional!
  style?: ViewStyle;
  textStyle?: TextStyle;
}


// --- 2. El Componente ---
export const ButtonWithIcon = ({
  title,
  onPress,
  variant = 'primary', // Valor por defecto
  iconName, // Sin valor por defecto (es undefined si no se pasa)
  style,
  textStyle
}: ButtonWithIconProps) => {

  let buttonVariantStyle;
  let textVariantStyle;

  switch (variant) {
    case 'secondary':
      buttonVariantStyle = styles.buttonSecondary;
      textVariantStyle = styles.textSecondary;
      break;
    case 'danger':
      buttonVariantStyle = styles.buttonDanger;
      textVariantStyle = styles.textDanger;
      break;
    case 'menu':
      buttonVariantStyle = styles.buttonMenu
      textVariantStyle = styles.textMenu;
      break;
    case 'primary': // 'primary' es el caso base
    default: // 'default' se usa si 'variant' es algo inesperado
      buttonVariantStyle = styles.buttonPrimary;
      textVariantStyle = styles.textPrimary;
      break;
  }
  // --- 4. Lógica de Icono Opcional ---
  // El estilo del texto SÓLO tendrá margen si hay un icono
  const textIconStyle = iconName ? styles.textWithIcon : styles.textWithoutIcon;

  return (
    <TouchableOpacity
      // Fusionamos: 1. Base, 2. Variante, 3. Estilo extra (pasado por props)
      style={[styles.buttonBase, buttonVariantStyle, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* --- RENDER CONDICIONAL DEL ICONO --- */}
      {/* Esto solo se renderiza si 'iconName' tiene un valor */}
      {iconName && (
        <Ionicons
          name={iconName}
          size={18}
          // El color del icono también depende de la variante
          color={variant === 'secondary' ? '#FFFFFF' : '#FFFFFF'}
        />
      )}

      <Text
        // Fusionamos: 1. Base, 2. Variante, 3. Estilo de icono, 4. Estilo extra
        style={[styles.textBase, textVariantStyle, textIconStyle, textStyle]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};


// --- 5. Stylesheet con Variantes ---
const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  textBase: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonPrimary: {
    backgroundColor: '#5b13ec',
  },
  textPrimary: {
    color: '#ffffff',
  },
  buttonSecondary: {
    backgroundColor: '#563d61ff',
  },
  textSecondary: {
    color: '#ffffff',
  },


  buttonDanger: {
    backgroundColor: '#c41212ff',
  },
  textDanger: {
    color: '#ffffff',
  },

  buttonMenu: {
    backgroundColor: '#161022',
  },
  textMenu: {
    color: '#ffffff',
  },


  textWithIcon: {
    marginLeft: 6, // Espacio entre icono y texto
  },
  textWithoutIcon: {
    marginLeft: 0, // Sin espacio si no hay icono
  },
});