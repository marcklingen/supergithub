
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { GithubIcon, Loader2 } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Extract error from URL if present
  useEffect(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    if (error) {
      toast({
        title: "Authentication Error",
        description: errorDescription?.replace(/\+/g, ' ') || "There was an error during authentication",
        variant: "destructive"
      });
      
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/repositories');
      }
    };
    
    checkUser();
  }, [navigate]);

  async function handleGitHubSignIn() {
    try {
      setLoading(true);
      
      // Add read:user scope to get basic profile info and user:email for email access
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
          scopes: 'read:user user:email repo'
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error signing in with GitHub",
        description: error.message || "An error occurred during GitHub sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to SuperGitHub</CardTitle>
          <CardDescription>
            Sign in with your GitHub account to access discussions with superpowers
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-center gap-2" 
            onClick={handleGitHubSignIn}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <GithubIcon size={16} className="mr-2" />
            )}
            <span>{loading ? 'Signing in...' : 'Sign in with GitHub'}</span>
          </Button>
        </CardContent>
        
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          Requires GitHub account with repositories that have discussions enabled
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
