
import { useState, useEffect } from 'react';
import { Discussion } from '@/lib/github';

interface UseDiscussionCommentsProps {
  discussionNumber: number;
  discussion: any;
}

export const useDiscussionComments = ({
  discussionNumber,
  discussion
}: UseDiscussionCommentsProps) => {
  const [optimisticComments, setOptimisticComments] = useState<any[]>([]);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticComments([]);
    setReplyingToCommentId(null);
  }, [discussionNumber]);

  useEffect(() => {
    if (discussion) {
      setOptimisticComments([]);
    }
  }, [discussion]);

  const handleAddComment = async (newComment: any) => {
    console.log("Adding comment to discussion:", newComment);
    
    if (newComment.isOptimistic) {
      // If this is a reply to another comment (has replyTo)
      if (newComment.replyTo && newComment.replyTo.id) {
        // Clone the current optimistic comments
        const updatedComments = [...optimisticComments];
        
        // Find the parent comment to add the reply to
        const parentCommentId = newComment.replyTo.id;
        const parentComment = findCommentById(parentCommentId, 
          [...(discussion?.comments?.nodes || []), ...updatedComments]);
        
        if (parentComment) {
          // Add the optimistic reply to the parent's replies
          newComment.replies = { nodes: [] };
          
          // Don't add duplicates (in case of re-renders)
          const existingOptimisticIdx = optimisticComments.findIndex(c => c.id === newComment.id);
          if (existingOptimisticIdx >= 0) {
            updatedComments.splice(existingOptimisticIdx, 1);
          }
          
          // Add the optimistic reply as a top-level optimistic comment
          // but with the replyTo field set, which will make it render as a reply
          updatedComments.push(newComment);
          setOptimisticComments(updatedComments);
        } else {
          console.error("Parent comment not found for reply:", parentCommentId);
        }
      } else {
        // Top-level comment handling (same as before)
        setOptimisticComments(prev => {
          const filtered = prev.filter(c => c.id !== newComment.id);
          newComment.replies = { nodes: [] };
          return [...filtered, newComment];
        });
      }
    } else {
      // When we receive the real comment back from the API
      // Find and remove the optimistic version
      const optimisticId = optimisticComments.find(c => 
        c.bodyHTML.replace(/<br>/g, '\n') === newComment.bodyHTML
      )?.id;
      
      if (optimisticId) {
        setOptimisticComments(prev => 
          prev.filter(c => c.id !== optimisticId)
        );
      } else {
        // If we couldn't find a matching optimistic comment, clear all optimistic comments
        // This is a fallback to prevent UI issues
        setOptimisticComments([]);
      }
    }
  };

  const handleReplyClick = (commentId: string) => {
    setReplyingToCommentId(commentId);
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

  const getAllComments = () => {
    if (!discussion || !discussion.comments) return { nodes: [] };

    // Get original comments from the discussion
    const originalComments = discussion.comments.nodes || [];
    
    // Filter out optimistic comments that should appear as replies
    const topLevelOptimisticComments = optimisticComments.filter(
      comment => !comment.replyTo || !comment.replyTo.id
    );
    
    // Get optimistic replies to add to the correct parent comments
    const optimisticReplies = optimisticComments.filter(
      comment => comment.replyTo && comment.replyTo.id
    );
    
    // Make a deep copy of the original comments to avoid modifying the source
    const enhancedComments = JSON.parse(JSON.stringify(originalComments));
    
    // Inject optimistic replies into the comments structure
    optimisticReplies.forEach(reply => {
      const parentId = reply.replyTo.id;
      
      // Try to find the parent comment in the enhanced comments
      for (const comment of enhancedComments) {
        if (comment.id === parentId) {
          // Add the reply directly to this comment's replies
          if (!comment.replies) {
            comment.replies = { nodes: [] };
          }
          comment.replies.nodes.push(reply);
          return;
        }
        
        // Check nested replies
        if (comment.replies && comment.replies.nodes) {
          const parent = findCommentById(parentId, comment.replies.nodes);
          if (parent) {
            if (!parent.replies) {
              parent.replies = { nodes: [] };
            }
            parent.replies.nodes.push(reply);
            return;
          }
        }
      }
    });
    
    return {
      ...discussion.comments,
      nodes: [
        ...enhancedComments,
        ...topLevelOptimisticComments
      ]
    };
  };

  const getReplyToComment = () => {
    if (!replyingToCommentId || !discussion) return null;
    
    return findCommentById(
      replyingToCommentId, 
      [...(discussion.comments?.nodes || []), ...optimisticComments]
    );
  };

  return {
    optimisticComments,
    replyingToCommentId,
    handleAddComment,
    handleReplyClick,
    handleCancelReply,
    getAllComments,
    getReplyToComment
  };
};
