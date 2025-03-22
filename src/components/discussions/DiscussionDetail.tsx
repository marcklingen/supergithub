
import React, { useEffect, useState } from 'react';
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
import { CommentComposer } from './discussion-components/CommentComposer';
import { toast } from '@/hooks/use-toast';

const DiscussionDetail = () => {
  const params = useParams();
  const { githubToken } = useAuth();
  const { activeRepository, activeCategory } = useRepo();
  const navigate = useNavigate();
  
  const discussionNumber = Number(params.discussionNumber);
  const [optimisticComments, setOptimisticComments] = useState<any[]>([]);
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
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
  
  // Reset optimistic comments when discussion changes
  useEffect(() => {
    setOptimisticComments([]);
  }, [discussionNumber]);
  
  // Clean up optimistic comments when the discussion data is refetched
  useEffect(() => {
    if (discussion) {
      // When data is refreshed, clear any optimistic comments that are no longer needed
      setOptimisticComments([]);
    }
  }, [data]);
  
  const handleBackClick = () => {
    navigate('/discussions');
  };
  
  const handleAddComment = async (newComment: any) => {
    console.log("Adding comment to discussion:", newComment);
    
    // If this is an optimistic comment, add it to our local state
    if (newComment.isOptimistic) {
      setOptimisticComments(prev => {
        // Replace existing optimistic comment (if we have one with same id)
        const filtered = prev.filter(c => c.id !== newComment.id);
        return [...filtered, newComment];
      });
    } else {
      // If it's a real comment from the API, remove any optimistic versions
      // Also identify if the new comment matches an optimistic one by comparing body content
      const optimisticId = optimisticComments.find(c => 
        c.bodyHTML.replace(/<br>/g, '\n') === newComment.bodyHTML
      )?.id;
      
      if (optimisticId) {
        setOptimisticComments(prev => 
          prev.filter(c => c.id !== optimisticId)
        );
      } else {
        // If no matching optimistic comment found, clear all optimistic comments
        // as a fallback to prevent duplicates
        setOptimisticComments([]);
      }
      
      // Refetch the discussion to get the latest comments
      setTimeout(() => {
        refetch();
      }, 1000);
    }
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
  
  // Merge API comments with optimistic comments
  const allComments = {
    ...discussion.comments,
    nodes: [
      ...discussion.comments.nodes,
      ...optimisticComments
    ]
  };
  
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
      
      <CommentsList comments={allComments} />
      
      <CommentComposer 
        discussionId={discussion.id} 
        discussionNumber={discussionNumber}
        onCommentAdded={handleAddComment}
      />
    </>
  );
};

export default DiscussionDetail;
