
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

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
    
    onSetToken(tokenInput.trim());
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set GitHub Token</DialogTitle>
          <DialogDescription>
            <p className="mb-4">
              A GitHub token with the <code className="bg-muted px-1 py-0.5 rounded">repo</code> and{" "}
              <code className="bg-muted px-1 py-0.5 rounded">write:discussion</code> scopes is required to access discussions.
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GitHub Developer Settings</a></li>
              <li>Create a new token (classic) with the <code className="bg-muted px-1 py-0.5 rounded">repo</code> and <code className="bg-muted px-1 py-0.5 rounded">write:discussion</code> scopes</li>
              <li>Copy the generated token and paste it below</li>
            </ol>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="token">GitHub Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_yourtokenhere"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
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
