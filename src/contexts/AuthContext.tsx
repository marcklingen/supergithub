
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  githubToken: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setManualGithubToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Improved function to extract GitHub token from user session
  const extractGitHubToken = (session: Session | null) => {
    if (!session) return null;
    
    console.log("Extracting GitHub token from session...");
    
    // First check for provider_token directly on the session object
    if (session.provider_token) {
      console.log("Found token in session.provider_token");
      return session.provider_token;
    }
    
    // Check for provider token in app_metadata
    const providerToken = session.user?.app_metadata?.provider_token;
    if (providerToken) {
      console.log("Found token in app_metadata.provider_token");
      return providerToken;
    }
    
    // Check in user_metadata for GitHub provider
    if (session.user?.user_metadata?.provider === 'github' && 
        session.user?.user_metadata?.access_token) {
      console.log("Found token in user_metadata.access_token");
      return session.user.user_metadata.access_token;
    }
    
    // Check directly in app_metadata for legacy structure
    if (session.user?.app_metadata?.provider === 'github' && 
        session.user?.app_metadata?.access_token) {
      console.log("Found token in app_metadata.access_token");
      return session.user.app_metadata.access_token;
    }
    
    // Check in localStorage for manually set token
    const manualToken = localStorage.getItem('manual_github_token');
    if (manualToken) {
      console.log("Found manually set token in localStorage");
      return manualToken;
    }
    
    console.log("No GitHub token found in session");
    
    return null;
  };

  // Function to manually set a GitHub token
  const setManualGithubToken = (token: string) => {
    // Store the token in localStorage
    localStorage.setItem('manual_github_token', token);
    // Update the state
    setGithubToken(token);
    console.log("Manually set GitHub token");
  };

  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    const initializeAuth = async () => {
      if (initialized) return;
      
      setLoading(true);
      
      try {
        console.log("Initializing auth context...");
        
        // Set up auth state listener FIRST
        const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
          console.log("Auth state changed, event:", event);
          
          if (event === 'SIGNED_OUT') {
            setSession(null);
            setUser(null);
            setGithubToken(null);
            console.log("User signed out, clearing state");
          } else {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            const token = extractGitHubToken(newSession);
            setGithubToken(token);
            console.log("Auth state updated, token available:", !!token);
          }
          
          setLoading(false);
        });
        
        authSubscription = data.subscription;
        
        // THEN check for existing session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        const token = extractGitHubToken(initialSession);
        setGithubToken(token);
        
        console.log("Initial session check complete, user:", !!initialSession?.user);
        console.log("Initial session check, token available:", !!token);
        
      } catch (error) {
        console.error("Error in auth setup:", error);
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [initialized]);

  const signOut = async () => {
    console.log("Signing out...");
    setLoading(true);
    
    try {
      // Clear all local state first
      setSession(null);
      setUser(null);
      
      // Clear GitHub token from localStorage
      localStorage.removeItem('manual_github_token');
      setGithubToken(null);
      
      // Clear active repository from local storage
      localStorage.removeItem('activeRepo');
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }
      
      console.log("Successfully signed out");
    } catch (error) {
      console.error("Error during sign out:", error);
      // Even if there's an error, we want to clear local state
      setSession(null);
      setUser(null);
      setGithubToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, githubToken, loading, signOut, setManualGithubToken }}>
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
