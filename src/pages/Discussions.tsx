
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

const Discussions = () => {
  const { activeRepository, activeCategory } = useRepo();
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
  
  return (
    <div className="flex-1 p-8">
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
