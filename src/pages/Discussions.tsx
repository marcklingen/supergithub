import React, { useState, useEffect } from 'react';
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
import { AlertTriangle } from 'lucide-react';
import { convertEmojiText } from '@/lib/utils';

const Discussions = () => {
  const { activeRepository, activeCategory, categories, setActiveCategory } = useRepo();
  const { githubToken, setManualGithubToken } = useAuth();
  const { discussionNumber } = useParams<{ discussionNumber: string }>();
  const navigate = useNavigate();
  
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  
  useEffect(() => {
    if (!githubToken) {
      const timer = setTimeout(() => {
        setShowTokenModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [githubToken]);
  
  useEffect(() => {
    if (!categories.length || !activeRepository) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (discussionNumber) return;
      
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
        const numericIndex = parseInt(e.key) - 1;
        if (numericIndex >= 0 && numericIndex < categories.length) {
          e.preventDefault();
          setActiveCategory(categories[numericIndex]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categories, activeCategory, discussionNumber, setActiveCategory]);
  
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

  const handleNavigateToRepositories = () => {
    navigate('/repositories');
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
                    {convertEmojiText(activeCategory.emoji)}
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
        
        <Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set GitHub Token</DialogTitle>
              <DialogDescription>
                <p className="mb-4">
                  A GitHub token with the <code className="bg-muted px-1 py-0.5 rounded">repo</code> scope is required to access discussions.
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GitHub Developer Settings</a></li>
                  <li>Create a new token (classic) with the <code className="bg-muted px-1 py-0.5 rounded">repo</code> scope</li>
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
              <Button variant="outline" onClick={() => setShowTokenModal(false)}>Cancel</Button>
              <Button onClick={handleSetToken}>Save Token</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {!githubToken ? (
          <div className="bg-muted p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-4">GitHub Token Required</h3>
            <p className="text-muted-foreground mb-4">
              A GitHub token with the <code className="bg-accent px-1 py-0.5 rounded">repo</code> scope is required to access discussions. 
              Please set your token to continue.
            </p>
            <Button onClick={() => setShowTokenModal(true)}>
              Set GitHub Token
            </Button>
          </div>
        ) : (
          <>
            {!activeRepository ? (
              <div className="bg-muted p-6 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-4">Select a Repository</h3>
                <p className="text-muted-foreground mb-4">
                  Please select a repository from the sidebar to view discussions.
                </p>
                <Button onClick={handleNavigateToRepositories}>
                  Manage Repositories
                </Button>
              </div>
            ) : !activeCategory ? (
              <div className="bg-muted p-6 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <h3 className="text-lg font-medium">No Discussion Category Selected</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  It looks like you don't have any discussion categories available for this repository. This could be due to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mb-6">
                  <li>Discussions are not enabled for this repository</li>
                  <li>Your GitHub token doesn't have sufficient permissions (needs <code className="bg-accent px-1 py-0.5 rounded">repo</code> scope)</li>
                  <li>No discussion categories have been created yet in the repository settings</li>
                </ul>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" onClick={() => navigate('/repositories')}>
                    Choose Another Repository
                  </Button>
                  <Button onClick={() => setShowTokenModal(true)}>
                    Update GitHub Token
                  </Button>
                </div>
              </div>
            ) : discussionNumber ? (
              <DiscussionDetail />
            ) : (
              <DiscussionList />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Discussions;
