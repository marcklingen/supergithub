
import React, { useEffect, useState, useRef } from 'react';
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

interface DiscussionDetailProps {
  prefetchedDiscussions?: any[];
}

const DiscussionDetail: React.FC<DiscussionDetailProps> = ({ prefetchedDiscussions = [] }) => {
  const params = useParams();
  const { githubToken } = useAuth();
  const { activeRepository, activeCategory } = useRepo();
  const navigate = useNavigate();
  
  const discussionNumber = Number(params.discussionNumber);
  const [optimisticComments, setOptimisticComments] = useState<any[]>([]);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const commentComposerRef = useRef<HTMLDivElement>(null);
  
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
  
  // Prefetch discussion details for adjacent discussions
  useEffect(() => {
    if (githubToken && activeRepository) {
      // Prefetch the next discussion details
      if (nextDiscussion) {
        const prefetchNext = async () => {
          try {
            const queryClient = window.queryClient; // Assuming queryClient is globally accessible
            if (queryClient) {
              await queryClient.prefetchQuery({
                queryKey: ['discussionDetails', activeRepository.owner, activeRepository.name, nextDiscussion.number, githubToken],
                queryFn: () => fetch(`https://api.github.com/graphql`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${githubToken}`,
                  },
                  body: JSON.stringify({
                    query: `
                      query GetDiscussionDetails($owner: String!, $name: String!, $number: Int!) {
                        repository(owner: $owner, name: $name) {
                          discussion(number: $number) {
                            id
                          }
                        }
                      }
                    `,
                    variables: { 
                      owner: activeRepository.owner, 
                      name: activeRepository.name, 
                      number: nextDiscussion.number 
                    }
                  }),
                }).then(r => r.json()),
              });
            }
          } catch (e) {
            console.log('Prefetch error:', e);
          }
        };
        
        // Prefetch the previous discussion details
        if (prevDiscussion) {
          const prefetchPrev = async () => {
            try {
              const queryClient = window.queryClient;
              if (queryClient) {
                await queryClient.prefetchQuery({
                  queryKey: ['discussionDetails', activeRepository.owner, activeRepository.name, prevDiscussion.number, githubToken],
                  queryFn: () => fetch(`https://api.github.com/graphql`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${githubToken}`,
                    },
                    body: JSON.stringify({
                      query: `
                        query GetDiscussionDetails($owner: String!, $name: String!, $number: Int!) {
                          repository(owner: $owner, name: $name) {
                            discussion(number: $number) {
                              id
                            }
                          }
                        }
                      `,
                      variables: { 
                        owner: activeRepository.owner, 
                        name: activeRepository.name, 
                        number: prevDiscussion.number 
                      }
                    }),
                  }).then(r => r.json()),
                });
              }
            } catch (e) {
              console.log('Prefetch error:', e);
            }
          };
          
          prefetchPrev();
        }
        
        prefetchNext();
      }
    }
  }, [discussionNumber, activeRepository, githubToken, nextDiscussion, prevDiscussion]);
  
  const navigateTo = (discussion: any) => {
    if (discussion) {
      navigate(`/discussions/${discussion.number}`);
    }
  };
  
  const discussion = data?.repository?.discussion;
  
  useEffect(() => {
    setOptimisticComments([]);
    setReplyingToCommentId(null);
  }, [discussionNumber]);
  
  useEffect(() => {
    if (discussion) {
      setOptimisticComments([]);
    }
  }, [data]);
  
  const handleBackClick = () => {
    navigate('/discussions');
  };
  
  const handleAddComment = async (newComment: any) => {
    console.log("Adding comment to discussion:", newComment);
    
    if (newComment.isOptimistic) {
      setOptimisticComments(prev => {
        const filtered = prev.filter(c => c.id !== newComment.id);
        newComment.replies = { nodes: [] };
        return [...filtered, newComment];
      });
    } else {
      const optimisticId = optimisticComments.find(c => 
        c.bodyHTML.replace(/<br>/g, '\n') === newComment.bodyHTML
      )?.id;
      
      if (optimisticId) {
        setOptimisticComments(prev => 
          prev.filter(c => c.id !== optimisticId)
        );
      } else {
        setOptimisticComments([]);
      }
      
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  };
  
  const handleReplyClick = (commentId: string) => {
    setReplyingToCommentId(commentId);
    
    setTimeout(() => {
      if (commentComposerRef.current) {
        commentComposerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const textarea = commentComposerRef.current.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }
    }, 100);
  };
  
  const handleCancelReply = () => {
    setReplyingToCommentId(null);
  };
  
  const findCommentById = (commentId: string, comments: any[]): any => {
    for (const comment of comments) {
      if (comment.id === commentId) return comment;
      if (comment.replies && comment.replies.nodes) {
        const found = findCommentById(commentId, comment.replies.nodes);
        if (found) return found;
      }
    }
    return null;
  };
  
  const replyToComment = replyingToCommentId 
    ? findCommentById(replyingToCommentId, [...discussion?.comments.nodes || [], ...optimisticComments])
    : null;
  
  const focusCommentComposer = () => {
    if (!replyingToCommentId) {
      if (commentComposerRef.current) {
        commentComposerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const textarea = commentComposerRef.current.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.metaKey ||
        e.ctrlKey
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
          if (replyingToCommentId) {
            setReplyingToCommentId(null);
          } else {
            handleBackClick();
          }
          break;
        case 'o':
          e.preventDefault();
          if (activeRepository) {
            window.open(`https://github.com/${activeRepository.owner}/${activeRepository.name}/discussions/${discussionNumber}`, '_blank');
          }
          break;
        case 'r':
          e.preventDefault();
          focusCommentComposer();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevDiscussion, nextDiscussion, activeRepository, discussionNumber, replyingToCommentId]);
  
  if (isLoading) {
    return <DiscussionSkeleton onBackClick={handleBackClick} />;
  }
  
  if (isError) {
    return <DiscussionError error={error as Error} onBackClick={handleBackClick} />;
  }
  
  if (!discussion) {
    return <DiscussionNotFound onBackClick={handleBackClick} />;
  }
  
  const allComments = {
    ...discussion.comments,
    nodes: [
      ...discussion.comments.nodes,
      ...optimisticComments.map(comment => ({
        ...comment,
        replies: comment.replies || { nodes: [] }
      }))
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
      
      <CommentsList 
        comments={allComments} 
        onReplyClick={handleReplyClick}
      />
      
      <div ref={commentComposerRef}>
        {replyingToCommentId ? (
          <CommentComposer 
            discussionId={discussion.id}
            discussionNumber={discussionNumber}
            onCommentAdded={handleAddComment}
            replyToId={replyingToCommentId}
            replyToComment={replyToComment}
            onCancelReply={handleCancelReply}
          />
        ) : (
          <CommentComposer 
            discussionId={discussion.id} 
            discussionNumber={discussionNumber}
            onCommentAdded={handleAddComment}
          />
        )}
      </div>
    </>
  );
};

export default DiscussionDetail;
