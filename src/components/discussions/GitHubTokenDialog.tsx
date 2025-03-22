
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ExternalLink, Key } from 'lucide-react';

interface GitHubTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetToken: (token: string) => void;
  tokenInput: string;
  setTokenInput: (token: string) => void;
}

const GitHubTokenDialog = ({
  open,
  onOpenChange,
  onSetToken,
  tokenInput,
  setTokenInput
}: GitHubTokenDialogProps) => {
  
  const handleSetToken = () => {
    if (!tokenInput.trim()) {
      toast({
        title: "Token required",
        description: "Please enter a GitHub token",
        variant: "destructive"
      });
      return;
    }
    
    if (!tokenInput.startsWith('ghp_') && !tokenInput.startsWith('github_pat_')) {
      toast({
        title: "Invalid token format",
        description: "GitHub tokens typically start with 'ghp_' or 'github_pat_'",
        variant: "destructive"
      });
      return;
    }
    
    onSetToken(tokenInput.trim());
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Set GitHub Token
          </DialogTitle>
          <DialogDescription>
            <p className="mb-4">
              A GitHub token with these scopes is required to access and comment on discussions:
            </p>
            <div className="bg-muted p-3 rounded-md mb-4">
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Go to <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                  GitHub Token Settings <ExternalLink size={12} />
                </a></li>
                <li>Enter a note like "SuperGitHub Discussions"</li>
                <li>Set an expiration if desired</li>
                <li>Check these scopes:
                  <ul className="list-disc pl-5 mt-1">
                    <li><code className="bg-background px-1 py-0.5 rounded">repo</code> (full control of private repositories)</li>
                    <li><code className="bg-background px-1 py-0.5 rounded">write:discussion</code> (read and write discussions)</li>
                    <li><code className="bg-background px-1 py-0.5 rounded">read:org</code> (access organization repositories - optional)</li>
                    <li><code className="bg-background px-1 py-0.5 rounded">write:issue</code> (may be needed for some repositories)</li>
                  </ul>
                </li>
                <li>Click "Generate token" and copy the generated token</li>
              </ol>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-400 text-sm font-medium mb-1">Important:</p>
              <p className="text-sm text-amber-700 dark:text-amber-500">
                Select the full <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">repo</code> scope checkbox, not just the individual permissions. This grants access to both public and private repositories.
              </p>
              <p className="text-sm mt-2 text-amber-700 dark:text-amber-500">
                Add <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">read:org</code> scope if you want to access and manage discussions in organization repositories.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="token">GitHub Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_yourtokenhere"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your token is stored locally in your browser and is never sent to our servers.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSetToken}>Save Token</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubTokenDialog;
