
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { GithubIcon } from 'lucide-react';

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
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate]);

  async function handleGitHubSignIn() {
    try {
      setLoading(true);
      
      // Use user:email scope to ensure we get access to the user's email
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
          scopes: 'user:email'
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
          <CardTitle className="text-2xl">Welcome</CardTitle>
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
            <GithubIcon size={16} />
            <span>{loading ? 'Signing in...' : 'Sign in with GitHub'}</span>
          </Button>
        </CardContent>
        
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
