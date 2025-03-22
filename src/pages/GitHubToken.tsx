
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const GitHubToken = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const token = user?.user_metadata?.provider_token;
  
  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      toast({
        title: "Token copied",
        description: "GitHub token copied to clipboard"
      });
    } else {
      toast({
        title: "No token available",
        description: "Please sign in with GitHub to get a token",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex-1 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">GitHub Token</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Your GitHub Access Token</CardTitle>
            <CardDescription>
              This token is used to authenticate with the GitHub API. It was obtained when you signed in with GitHub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {token ? (
              <div className="bg-muted p-4 rounded-md relative font-mono text-sm break-all">
                {token}
              </div>
            ) : (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                No GitHub token available. Please sign in with GitHub to get a token.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              This token expires after some time. If you encounter API errors, try signing out and in again.
            </div>
            <Button 
              onClick={copyToken} 
              disabled={!token} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy size={16} />
              Copy Token
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Token Information</h2>
          <div className="space-y-4">
            <p>
              <strong>What is this token?</strong> This is an OAuth access token provided by GitHub when you signed in. 
              It allows this application to make API requests to GitHub on your behalf.
            </p>
            <p>
              <strong>Is it secure?</strong> Yes, this token is stored only in your browser and is never sent to our servers. 
              It's used directly from your browser to communicate with GitHub's API.
            </p>
            <p>
              <strong>What permissions does it have?</strong> The token has read access to public repositories and discussions. 
              It can only perform actions that you've authorized during the GitHub sign-in process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubToken;
