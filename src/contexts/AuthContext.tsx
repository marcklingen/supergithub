
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  githubToken: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Improved function to extract GitHub token from user session
  const extractGitHubToken = (session: Session | null) => {
    if (!session?.user) return null;
    
    console.log("Extracting GitHub token from session...");
    
    // Check for provider token in app_metadata
    const providerToken = session.user.app_metadata?.provider_token;
    if (providerToken) {
      console.log("Found token in app_metadata.provider_token");
      return providerToken;
    }
    
    // Check in user_metadata for GitHub provider
    if (session.user.user_metadata?.provider === 'github' && 
        session.user.user_metadata?.access_token) {
      console.log("Found token in user_metadata.access_token");
      return session.user.user_metadata.access_token;
    }
    
    // Check directly in app_metadata for legacy structure
    if (session.user.app_metadata?.provider === 'github' && 
        session.user.app_metadata?.access_token) {
      console.log("Found token in app_metadata.access_token");
      return session.user.app_metadata.access_token;
    }
    
    console.log("No GitHub token found in session");
    console.log("User metadata:", session.user.user_metadata);
    console.log("App metadata:", session.user.app_metadata);
    
    return null;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        const token = extractGitHubToken(session);
        setGithubToken(token);
        console.log("Auth state changed, token available:", !!token);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      const token = extractGitHubToken(session);
      setGithubToken(token);
      console.log("Initial session check, token available:", !!token);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, githubToken, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
