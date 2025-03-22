
import { createClient } from '@supabase/supabase-js';

// These would normally come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client if no URL/key is provided
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key not provided. Using Supabase client from integrations folder as fallback.');
    // Import from the integrations folder instead
    try {
      return require('@/integrations/supabase/client').supabase;
    } catch (error) {
      console.error('Failed to import Supabase client from integrations folder:', error);
      
      // Return a mock client that doesn't throw errors but logs warnings
      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
          signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        },
        from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
      };
    }
  }

  // If we have valid credentials, create a real client
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

export const supabase = createSupabaseClient();

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};
