import Constants from 'expo-constants';

/**
 * Obtiene la URL base del servicio, según el entorno.
 * - Lee primero de app.config.js (Constants)
 * - Luego de process.env (por compatibilidad)
 * - Finalmente usa un valor por defecto si nada existe
 */
export const urlService: string =
  (Constants.expoConfig?.extra?.urlService as string) ??
  process.env.EXPO_PUBLIC_URLSERVICE ??
  'http://localhost:8081/playlist/';

console.log('✅ URL SERVICE =>', urlService);