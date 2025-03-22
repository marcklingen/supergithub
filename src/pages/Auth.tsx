
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { GithubIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema for login form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Schema for password reset form validation
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [searchParams] = useSearchParams();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPasswordResetForm, setShowPasswordResetForm] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
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

  // Process hash fragment for password reset tokens
  useEffect(() => {
    // Check for reset password hash
    const hash = window.location.hash;
    if (hash && hash.includes('#access_token=')) {
      // Parse the hash fragment
      const hashParams = new URLSearchParams(hash.substring(1));
      const token = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      if (token && type === 'recovery') {
        console.log('Password reset token detected');
        setAccessToken(token);
        setShowPasswordResetForm(true);
        
        // Clean the URL and remove hash
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [toast]);

  // Extract error from URL if present
  useEffect(() => {
    // Check for errors in URL params
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      toast({
        title: "Authentication Error",
        description: errorDescription?.replace(/\+/g, ' ') || "There was an error during authentication",
        variant: "destructive"
      });
      
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, toast]);

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
      
      // Make sure to request 'repo' scope to get repository access
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin + '/auth', // Explicitly redirect to the /auth route
          scopes: 'repo read:user user:email' // Ensure repo scope is included
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

  async function handleEmailSignIn(values: LoginFormValues) {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      
      navigate('/repositories');
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message || "An error occurred during sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignUp(values: LoginFormValues) {
    try {
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
      toast({
        title: "Error signing up",
        description: error.message || "An error occurred during sign up",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle password reset request
  async function handleResetPassword(email: string) {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth',
      });

      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link",
      });
    } catch (error: any) {
      toast({
        title: "Error sending reset email",
        description: error.message || "An error occurred while sending the reset email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle setting a new password
  async function handleSetNewPassword(values: ResetPasswordFormValues) {
    try {
      setLoading(true);
      
      if (!accessToken) {
        throw new Error("Reset token is missing");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) throw error;
      
      setResetSuccess(true);
      setShowPasswordResetForm(false);
      
      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password",
      });
    } catch (error: any) {
      toast({
        title: "Error resetting password",
        description: error.message || "An error occurred while resetting your password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Show reset password form
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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
          {resetSuccess && (
            <Alert className="mb-4">
              <AlertTitle>Password Reset Successful</AlertTitle>
              <AlertDescription>
                You can now log in with your new password.
              </AlertDescription>
            </Alert>
          )}

          {showPasswordResetForm ? (
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Set New Password</AlertTitle>
                <AlertDescription>
                  Please enter your new password below.
                </AlertDescription>
              </Alert>
              
              <Form {...resetPasswordForm}>
                <form className="space-y-4" onSubmit={resetPasswordForm.handleSubmit(handleSetNewPassword)}>
                  <FormField
                    control={resetPasswordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resetPasswordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Setting New Password...</span>
                      </>
                    ) : (
                      <span>Set New Password</span>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="w-full justify-center gap-2" 
                onClick={handleGitHubSignIn}
                disabled={loading}
              >
                {loading && !showResetForm ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <GithubIcon size={16} className="mr-2" />
                )}
                <span>{loading && !showResetForm ? 'Signing in...' : 'Sign in with GitHub'}</span>
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

                  {showResetForm ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <Input 
                          id="reset-email" 
                          placeholder="email@example.com" 
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          className="flex-1"
                          onClick={() => handleResetPassword(resetEmail)}
                          disabled={loading || !resetEmail}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <span>Send Reset Link</span>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowResetForm(false)}
                          disabled={loading}
                        >
                          Back to Login
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
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

                          <div className="flex justify-end">
                            <Button 
                              type="button" 
                              variant="link" 
                              className="text-xs px-0"
                              onClick={() => setShowResetForm(true)}
                            >
                              Forgot password?
                            </Button>
                          </div>

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
                    </>
                  )}
                </div>
              )}
            </>
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
