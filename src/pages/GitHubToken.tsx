
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Copy, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/layout/Navbar';

const GitHubToken = () => {
  const { githubToken, session, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const copyToClipboard = async () => {
    if (githubToken) {
      try {
        await navigator.clipboard.writeText(githubToken);
        setCopied(true);
        toast({
          title: "Token Copied",
          description: "GitHub token has been copied to clipboard",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Copy Failed",
          description: "Could not copy token to clipboard",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">GitHub Token Information</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          View and copy your GitHub token for debugging purposes
        </p>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>GitHub Authentication Status</CardTitle>
            <CardDescription>
              Current authentication information from Supabase and GitHub
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {githubToken ? (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>GitHub Token Available</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Your GitHub token is available and ready to use.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="p-3 bg-muted rounded-md overflow-hidden overflow-ellipsis whitespace-nowrap flex-1 text-xs font-mono">
                      {githubToken.substring(0, 12)}...{githubToken.substring(githubToken.length - 8)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyToClipboard}
                      disabled={copied}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          <span>Copy Full Token</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs mt-4">
                    Token length: {githubToken.length} characters
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>GitHub Token Missing</AlertTitle>
                <AlertDescription>
                  <p>No GitHub token found. Please sign in with GitHub to get a token.</p>
                  <div className="mt-4">
                    <Button 
                      size="sm"
                      onClick={() => window.location.href = '/auth'}
                    >
                      Sign in with GitHub
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Debug Information</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auth Provider:</span>
                  <span>{user?.app_metadata?.provider || 'Not authenticated'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono text-xs">{user?.id || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{user?.email || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session Active:</span>
                  <span>{session ? 'Yes' : 'No'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Has provider_token:</span>
                  <span>{session?.provider_token ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <div className="text-sm text-muted-foreground flex items-center">
              <Info className="h-4 w-4 mr-2" />
              <span>This information is useful for debugging GitHub API issues</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Refresh</span>
            </Button>
          </CardFooter>
        </Card>
        
        {session && (
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-sm font-medium mb-2">Session Data Preview</h3>
            <pre className="text-xs overflow-auto max-h-64 p-2 bg-card rounded border">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubToken;
