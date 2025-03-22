
import { createClient } from '@supabase/supabase-js';
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

// These would normally come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a Supabase client with proper error handling
const createSupabaseClient = () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase URL or Anon Key not provided in environment variables. Using Supabase client from integrations folder as fallback.');
      
      // Use the client from the integrations folder
      return integrationSupabase;
    }

    // If we have valid credentials, create a real client
    console.log('Creating Supabase client with URL and key from environment variables');
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    
    // Return a mock client that doesn't throw errors but logs warnings
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithOAuth: async () => {
          console.warn('Supabase not configured: signInWithOAuth called');
          return { data: null, error: { message: 'Supabase not configured' } };
        },
        signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
    };
  }
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
