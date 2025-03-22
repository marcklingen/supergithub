
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import DiscussionList from '@/components/discussions/DiscussionList';
import DiscussionDetail from '@/components/discussions/DiscussionDetail';

const Discussions = () => {
  const { activeRepository, activeCategory } = useRepo();
  const { githubToken, setManualGithubToken } = useAuth();
  const { discussionNumber } = useParams<{ discussionNumber: string }>();
  const navigate = useNavigate();
  
  // State for the token input modal
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  
  const handleSetToken = () => {
    if (!tokenInput.trim()) {
      toast({
        title: "Token required",
        description: "Please enter a GitHub token",
        variant: "destructive"
      });
      return;
    }
    
    setManualGithubToken(tokenInput.trim());
    setShowTokenModal(false);
    toast({
      title: "Token Set",
      description: "GitHub token has been set successfully",
    });
  };
  
  return (
    <div className="flex-1 p-8">
      <div className="max-w-5xl mx-auto mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {activeCategory ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label={activeCategory.name}>
                    {activeCategory.emoji}
                  </span>
                  <span>{activeCategory.name} Discussions</span>
                </div>
              ) : (
                "Discussions"
              )}
            </h1>
            {activeRepository && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{activeRepository.fullName}</Badge>
                {activeCategory?.description && (
                  <p className="text-muted-foreground text-sm">{activeCategory.description}</p>
                )}
              </div>
            )}
          </div>
          {!githubToken && (
            <Button variant="outline" onClick={() => setShowTokenModal(true)}>
              Set GitHub Token
            </Button>
          )}
        </div>
        
        {/* Token input modal */}
        <Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set GitHub Token</DialogTitle>
              <DialogDescription>
                A GitHub token is required to access discussions. Please enter your token below.
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
              <Button variant="outline" onClick={() => setShowTokenModal(false)}>Cancel</Button>
              <Button onClick={handleSetToken}>Save Token</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {!githubToken ? (
          <div className="bg-muted p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-4">GitHub Token Required</h3>
            <p className="text-muted-foreground mb-4">
              A GitHub token is required to access discussions. 
              Please set your token to continue.
            </p>
            <Button onClick={() => setShowTokenModal(true)}>
              Set GitHub Token
            </Button>
          </div>
        ) : discussionNumber ? (
          <DiscussionDetail />
        ) : (
          <DiscussionList />
        )}
      </div>
    </div>
  );
};

export default Discussions;
