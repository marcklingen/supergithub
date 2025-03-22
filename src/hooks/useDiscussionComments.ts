
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

    return {
      ...discussion.comments,
      nodes: [
        ...discussion.comments.nodes,
        ...optimisticComments.map(comment => ({
          ...comment,
          replies: comment.replies || { nodes: [] }
        }))
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
