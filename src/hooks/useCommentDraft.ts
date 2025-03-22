
import { useState, useEffect } from 'react';

interface UseCommentDraftProps {
  discussionNumber: number;
  replyToId: string | null;
}

export const useCommentDraft = ({ discussionNumber, replyToId }: UseCommentDraftProps) => {
  const [comment, setComment] = useState('');
  
  // Generate a unique key for this comment draft
  const getDraftKey = () => {
    return replyToId 
      ? `discussion-${discussionNumber}-reply-${replyToId}-draft` 
      : `discussion-${discussionNumber}-draft`;
  };
  
  // Load saved draft when component mounts
  useEffect(() => {
    const draftKey = getDraftKey();
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      setComment(savedDraft);
    }
  }, [discussionNumber, replyToId]);
  
  // Save draft as user types
  useEffect(() => {
    const draftKey = getDraftKey();
    
    const debounceTimer = setTimeout(() => {
      if (comment.trim()) {
        localStorage.setItem(draftKey, comment);
      }
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [comment, discussionNumber, replyToId]);
  
  // Clear draft from storage
  const clearDraft = () => {
    const draftKey = getDraftKey();
    localStorage.removeItem(draftKey);
    setComment('');
  };
  
  return {
    comment,
    setComment,
    clearDraft
  };
};
