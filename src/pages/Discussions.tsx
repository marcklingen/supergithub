
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import DiscussionList from '@/components/discussions/DiscussionList';
import DiscussionDetail from '@/components/discussions/DiscussionDetail';
import GitHubTokenDialog from '@/components/discussions/GitHubTokenDialog';
import EmptyRepositoryState from '@/components/discussions/EmptyRepositoryState';
import TokenRequiredState from '@/components/discussions/TokenRequiredState';
import DiscussionHeader from '@/components/discussions/DiscussionHeader';
import KeyboardShortcutBar from '@/components/keyboard/KeyboardShortcutBar';
import { useRepositoryDiscussions, Discussion } from '@/lib/github';

const Discussions = () => {
  const { activeRepository, activeCategory } = useRepo();
  const { githubToken, setManualGithubToken } = useAuth();
  const { discussionNumber } = useParams<{ discussionNumber: string }>();
  const navigate = useNavigate();
  
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  
  // Prefetch discussions when repository and category are selected
  const { data: discussionsData } = useRepositoryDiscussions(
    activeRepository?.owner || '',
    activeRepository?.name || '',
    activeCategory?.id || '',
    50,  // Increase the number to prefetch more discussions
    undefined,
    githubToken,
    {
      enabled: Boolean(activeRepository?.owner) && 
              Boolean(activeRepository?.name) && 
              Boolean(activeCategory?.id) && 
              Boolean(githubToken),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  
  useEffect(() => {
    if (!githubToken) {
      const timer = setTimeout(() => {
        setShowTokenModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [githubToken]);
  
  const handleSetToken = (token: string) => {
    setManualGithubToken(token);
    setShowTokenModal(false);
    toast({
      title: "Token Set",
      description: "GitHub token has been set successfully",
    });
  };

  const handleNavigateToRepositories = () => {
    navigate('/repositories');
  };
  
  // Prefetch the discussions data for the DiscussionDetail component
  const prefetchedDiscussions: Discussion[] = discussionsData?.repository?.discussions?.nodes || [];
  
  return (
    <div className="flex-1 p-8 pb-16">
      <div className="max-w-5xl mx-auto mt-8">
        <DiscussionHeader
          activeCategory={activeCategory}
          activeRepository={activeRepository}
          githubToken={githubToken}
          onShowTokenModal={() => setShowTokenModal(true)}
        />
        
        <GitHubTokenDialog
          open={showTokenModal}
          onOpenChange={setShowTokenModal}
          onSetToken={handleSetToken}
          tokenInput={tokenInput}
          setTokenInput={setTokenInput}
        />
        
        {!githubToken ? (
          <TokenRequiredState onShowTokenModal={() => setShowTokenModal(true)} />
        ) : (
          <>
            {!activeRepository ? (
              <EmptyRepositoryState onNavigateToRepositories={handleNavigateToRepositories} />
            ) : discussionNumber ? (
              <DiscussionDetail prefetchedDiscussions={prefetchedDiscussions} />
            ) : (
              <DiscussionList prefetchedDiscussions={prefetchedDiscussions} />
            )}
          </>
        )}
      </div>
      
      <KeyboardShortcutBar />
    </div>
  );
};

export default Discussions;
