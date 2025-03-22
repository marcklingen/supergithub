
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { GithubIcon, Loader2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Schema for login form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check if in development mode (based on environment)
  useEffect(() => {
    const isDevelopment = import.meta.env.MODE === 'development' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname.includes('preview');
    setIsDevMode(isDevelopment);
    console.log('Development mode:', isDevelopment);
  }, []);

  // Extract error from URL if present
  useEffect(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    if (error) {
      setLoginError(errorDescription?.replace(/\+/g, ' ') || "There was an error during authentication");
      
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User already logged in, redirecting to repositories');
      navigate('/repositories');
    }
  }, [user, authLoading, navigate]);

  async function handleGitHubSignIn() {
    try {
      // Clear any previous errors
      setLoginError(null);
      
      if (loading) {
        console.log('Already processing a sign-in request, ignoring');
        return;
      }
      
      setLoading(true);
      console.log('Initiating GitHub sign-in');
      
      // Updated scopes to include write:discussion permission
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth`, // Explicitly redirect to the /auth route
          scopes: 'repo read:user user:email write:discussion', // Added write:discussion scope
        }
      });

      if (error) {
        console.error('GitHub sign-in error:', error);
        setLoginError(error.message || "Error signing in with GitHub");
        setLoading(false);
        return;
      }

      console.log('GitHub sign-in initiated successfully');
    } catch (error: any) {
      console.error('Error in handleGitHubSignIn:', error);
      setLoginError(error.message || "An error occurred during GitHub sign in");
      setLoading(false);
    }
    // Note: Not setting loading to false here because we're being redirected
  }

  async function handleEmailSignIn(values: LoginFormValues) {
    try {
      setLoginError(null);
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      
      navigate('/repositories');
    } catch (error: any) {
      setLoginError(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignUp(values: LoginFormValues) {
    try {
      setLoginError(null);
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: window.location.origin + '/auth',
        }
      });

      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
      });
    } catch (error: any) {
      setLoginError(error.message || "An error occurred during sign up");
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
            Sign in with your {isDevMode ? "GitHub account or credentials" : "GitHub account"} to access discussions with superpowers
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            variant="outline" 
            className="w-full justify-center gap-2" 
            onClick={handleGitHubSignIn}
            disabled={loading || authLoading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <GithubIcon size={16} className="mr-2" />
            )}
            <span>{loading ? 'Signing in...' : 'Sign in with GitHub'}</span>
          </Button>

          {isDevMode && (
            <div className="pt-4 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Development Mode Options
                  </span>
                </div>
              </div>

              <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(handleEmailSignIn)}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Sign In</span>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      className="flex-1"
                      onClick={() => form.handleSubmit(handleEmailSignUp)()}
                    >
                      Sign Up
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          {isDevMode ? 
            "Development environment: Email/password is available" : 
            "Requires GitHub account with repositories that have discussions enabled"}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
