
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscussionDetails, useRepositoryDiscussions } from '@/lib/github';
import { DiscussionSkeleton } from './discussion-components/DiscussionSkeleton';
import { DiscussionError } from './discussion-components/DiscussionError';
import { DiscussionNotFound } from './discussion-components/DiscussionNotFound';
import { DiscussionNavigationBar } from './discussion-components/DiscussionNavigationBar';
import { DiscussionContent } from './discussion-components/DiscussionContent';
import { CommentsList } from './discussion-components/CommentsList';

const DiscussionDetail = () => {
  const params = useParams();
  const { githubToken } = useAuth();
  const { activeRepository, activeCategory } = useRepo();
  const navigate = useNavigate();
  
  const discussionNumber = Number(params.discussionNumber);
  
  const {
    data,
    isLoading,
    isError,
    error,
  } = useDiscussionDetails(
    activeRepository?.owner || '',
    activeRepository?.name || '',
    discussionNumber,
    githubToken
  );
  
  const { data: discussionsData } = useRepositoryDiscussions(
    activeRepository?.owner || '',
    activeRepository?.name || '',
    activeCategory?.id || '',
    50,
    undefined,
    githubToken
  );
  
  const discussions = discussionsData?.repository?.discussions?.nodes || [];
  
  const currentIndex = discussions.findIndex(
    (discussion) => discussion.number === discussionNumber
  );
  
  const prevDiscussion = currentIndex > 0 ? discussions[currentIndex - 1] : null;
  const nextDiscussion = currentIndex < discussions.length - 1 ? discussions[currentIndex + 1] : null;
  
  const navigateTo = (discussion: any) => {
    if (discussion) {
      navigate(`/discussions/${discussion.number}`);
    }
  };
  
  const discussion = data?.repository?.discussion;
  
  const handleBackClick = () => {
    navigate('/discussions');
  };
  
  // Add useEffect to handle the Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      
      switch (e.key) {
        case 'k':
          e.preventDefault();
          if (prevDiscussion) {
            navigateTo(prevDiscussion);
          }
          break;
        case 'j':
          e.preventDefault();
          if (nextDiscussion) {
            navigateTo(nextDiscussion);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleBackClick();
          break;
        case 'o':
          e.preventDefault();
          if (activeRepository) {
            window.open(`https://github.com/${activeRepository.owner}/${activeRepository.name}/discussions/${discussionNumber}`, '_blank');
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevDiscussion, nextDiscussion, activeRepository, discussionNumber]);
  
  if (isLoading) {
    return <DiscussionSkeleton onBackClick={handleBackClick} />;
  }
  
  if (isError) {
    return <DiscussionError error={error as Error} onBackClick={handleBackClick} />;
  }
  
  if (!discussion) {
    return <DiscussionNotFound onBackClick={handleBackClick} />;
  }
  
  return (
    <>
      <DiscussionNavigationBar
        prevDiscussion={prevDiscussion}
        nextDiscussion={nextDiscussion}
        navigateTo={navigateTo}
        onBackClick={handleBackClick}
        activeRepository={activeRepository}
        discussionNumber={discussionNumber}
      />
      
      <DiscussionContent discussion={discussion} />
      
      <CommentsList comments={discussion.comments} />
    </>
  );
};

export default DiscussionDetail;
