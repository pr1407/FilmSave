import { createClient } from '@supabase/supabase-js';

// Un adaptador simple que usa el localStorage del navegador
const LocalStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Configuración específica para la web
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: LocalStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});