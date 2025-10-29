import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js'; // Importar tipo de sesión
export { supabase };
export const signInWithEmail = async (email: string, password: string): Promise<{ session: Session | null; error: any }> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { session: data.session, error };
};

export const signUpWithEmail = async (email: string, password: string): Promise<{ session: Session | null; error: any }> => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { session: data.session, error };
};

export const signOut = async (): Promise<{ error: any }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async (): Promise<{ session: Session | null; error: any }> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};