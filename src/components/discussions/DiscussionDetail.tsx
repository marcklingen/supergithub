
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscussionDetails, useRepositoryDiscussions, Discussion } from '@/lib/github';
import { DiscussionSkeleton } from './discussion-components/DiscussionSkeleton';
import { DiscussionError } from './discussion-components/DiscussionError';
import { DiscussionNotFound } from './discussion-components/DiscussionNotFound';
import { DiscussionNavigationBar } from './discussion-components/DiscussionNavigationBar';
import { DiscussionContent } from './discussion-components/DiscussionContent';
import { DiscussionResponse } from './discussion-components/DiscussionResponse';
import { useDiscussionNavigation } from '@/hooks/useDiscussionNavigation';
import { useDiscussionPrefetch } from '@/hooks/useDiscussionPrefetch';
import { useDiscussionComments } from '@/hooks/useDiscussionComments';

interface DiscussionDetailProps {
  prefetchedDiscussions?: Discussion[];
}

const DiscussionDetail: React.FC<DiscussionDetailProps> = ({ prefetchedDiscussions = [] }) => {
  const params = useParams();
  const { githubToken } = useAuth();
  const { activeRepository, activeCategory } = useRepo();
  
  const discussionNumber = Number(params.discussionNumber);
  
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
  
  // Only fetch if we don't have prefetched discussions
  const { data: discussionsData } = useRepositoryDiscussions(
    activeRepository?.owner || '',
    activeRepository?.name || '',
    activeCategory?.id || '',
    50,
    undefined,
    githubToken,
    {
      // Only fetch if prefetchedDiscussions is empty
      enabled: prefetchedDiscussions.length === 0 && 
              Boolean(activeRepository?.owner) && 
              Boolean(activeRepository?.name) && 
              Boolean(activeCategory?.id) && 
              Boolean(githubToken),
    }
  );
  
  // Use prefetched discussions if available, otherwise use fetched data
  const discussions = prefetchedDiscussions.length > 0 
    ? prefetchedDiscussions 
    : (discussionsData?.repository?.discussions?.nodes || []);
  
  const currentIndex = discussions.findIndex(
    (discussion) => discussion.number === discussionNumber
  );
  
  const prevDiscussion = currentIndex > 0 ? discussions[currentIndex - 1] : null;
  const nextDiscussion = currentIndex < discussions.length - 1 ? discussions[currentIndex + 1] : null;
  
  const discussion = data?.repository?.discussion;
  
  // Use custom hooks
  const {
    optimisticComments,
    replyingToCommentId,
    handleAddComment,
    handleReplyClick,
    handleCancelReply,
    getAllComments,
    getReplyToComment
  } = useDiscussionComments({
    discussionNumber,
    discussion
  });
  
  const { navigateTo, handleBackClick } = useDiscussionNavigation({
    prevDiscussion,
    nextDiscussion,
    discussionNumber,
    replyingToCommentId,
    onCancelReply: handleCancelReply,
    activeRepository
  });
  
  useDiscussionPrefetch({
    githubToken,
    activeRepository,
    prevDiscussion,
    nextDiscussion
  });
  
  // Add a refetch after a successful comment post
  useEffect(() => {
    if (!optimisticComments.length) return;
    
    // If we have optimistic comments but they're not real yet
    if (optimisticComments.some(c => c.isOptimistic)) return;
    
    const timer = setTimeout(() => {
      refetch();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [optimisticComments, refetch]);
  
  if (isLoading) {
    return <DiscussionSkeleton onBackClick={handleBackClick} />;
  }
  
  if (isError) {
    return <DiscussionError error={error as Error} onBackClick={handleBackClick} />;
  }
  
  if (!discussion) {
    return <DiscussionNotFound onBackClick={handleBackClick} />;
  }
  
  const allComments = getAllComments();
  const replyToComment = getReplyToComment();
  
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
      
      <DiscussionResponse
        discussion={discussion}
        allComments={allComments}
        replyingToCommentId={replyingToCommentId}
        replyToComment={replyToComment}
        discussionNumber={discussionNumber}
        onReplyClick={handleReplyClick}
        onCancelReply={handleCancelReply}
        onCommentAdded={handleAddComment}
      />
    </>
  );
};

export default DiscussionDetail;
