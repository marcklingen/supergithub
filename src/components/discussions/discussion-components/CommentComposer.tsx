
import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAddDiscussionComment } from '@/lib/github';
import { toast } from '@/hooks/use-toast';
import { useCommentDraft } from '@/hooks/useCommentDraft';
import { CommentForm } from './comment-composer/CommentForm';
import { CommentError } from './comment-composer/CommentError';
import { ReplyHeader } from './comment-composer/ReplyHeader';

interface CommentComposerProps {
  discussionId: string;
  discussionNumber: number;
  onCommentAdded: (newComment: any) => void;
  replyToId?: string | null;
  replyToComment?: any;
  onCancelReply?: () => void;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({ 
  discussionId, 
  discussionNumber,
  onCommentAdded,
  replyToId = null,
  replyToComment = null,
  onCancelReply
}) => {
  const { user, githubToken, setManualGithubToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showTokenHelp, setShowTokenHelp] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const addComment = useAddDiscussionComment();
  
  const { comment, setComment, clearDraft } = useCommentDraft({
    discussionNumber,
    replyToId
  });
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && textareaRef.current === document.activeElement) {
        e.preventDefault();
        handleSubmit();
      }
      
      if (e.key === 'Escape' && textareaRef.current === document.activeElement) {
        e.preventDefault();
        textareaRef.current.blur();
        if (onCancelReply) {
          onCancelReply();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [comment, onCancelReply]);
  
  useEffect(() => {
    if (textareaRef.current && replyToId) {
      textareaRef.current.focus();
    }
  }, [replyToId]);
  
  const handleSubmit = async () => {
    if (!comment.trim() || !githubToken || !discussionId) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);
    setShowTokenHelp(false);
    
    const userDisplayName = user?.user_metadata?.user_name || 
                          user?.user_metadata?.full_name || 
                          user?.email?.split('@')[0] || 
                          'You';
    
    const userAvatarUrl = user?.user_metadata?.avatar_url || '';
    const userProfileUrl = user?.user_metadata?.provider_id ? 
                          `https://github.com/${user.user_metadata.provider_id}` : 
                          '#';
    
    const optimisticId = `optimistic-${Date.now()}`;
    
    const optimisticComment = {
      id: optimisticId,
      bodyHTML: comment.replace(/\n/g, '<br>'),
      createdAt: new Date().toISOString(),
      author: {
        login: userDisplayName,
        avatarUrl: userAvatarUrl,
        url: userProfileUrl
      },
      isOptimistic: true,
      upvoteCount: 0,
      reactions: { nodes: [] },
      replyTo: replyToId ? { id: replyToId } : null
    };
    
    // Add the optimistic comment to the UI
    onCommentAdded(optimisticComment);
    
    try {
      console.log("Submitting comment to GitHub API", { 
        discussionId, 
        body: comment, 
        replyToId
      });
      
      const result = await addComment.mutateAsync({
        discussionId,
        body: comment,
        replyToId,
        token: githubToken
      });
      
      console.log("Comment API response:", result);
      
      clearDraft();
      
      if (onCancelReply) {
        onCancelReply();
      }
      
      const realComment = result?.addDiscussionComment?.comment;
      if (realComment) {
        // Pass the real comment back to the parent component
        console.log("Passing real comment to parent:", realComment);
        onCommentAdded(realComment);
        
        toast({
          title: "Comment posted",
          description: "Your comment has been successfully posted"
        });
      } else {
        throw new Error("Invalid response format from GitHub API");
      }
    } catch (error: any) {
      console.error('Error posting comment:', error);
      
      let errorMsg = "Your comment couldn't be posted, but it's saved as a draft";
      
      if (error.message?.includes("Resource not accessible by integration")) {
        errorMsg = "The GitHub token doesn't have permission to post comments. You need a token with 'repo', 'write:discussion', and possibly 'write:issue' scopes.";
        setShowTokenHelp(true);
      } else if (error.message?.includes("FORBIDDEN")) {
        errorMsg = "GitHub API returned a FORBIDDEN error. Your token lacks the required permissions.";
        setShowTokenHelp(true);
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        title: "Failed to post comment",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReauth = () => {
    localStorage.removeItem('manual_github_token');
    window.location.href = '/auth';
  };
  
  return (
    <div className={`mt-6 border rounded-md p-4 bg-card ${replyToId ? 'border-primary/30' : ''}`}>
      <ReplyHeader 
        replyToComment={replyToComment} 
        onCancelReply={onCancelReply} 
      />
      
      <CommentError 
        errorMessage={errorMessage || ''} 
        showTokenHelp={showTokenHelp} 
        handleReauth={handleReauth} 
      />
      
      <CommentForm 
        user={user}
        comment={comment}
        isSubmitting={isSubmitting}
        textareaRef={textareaRef}
        onCommentChange={setComment}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

