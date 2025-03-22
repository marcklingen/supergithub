
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAddDiscussionComment } from '@/lib/github';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentComposerProps {
  discussionId: string;
  discussionNumber: number;
  onCommentAdded: (newComment: any) => void;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({ 
  discussionId, 
  discussionNumber,
  onCommentAdded
}) => {
  const { user, githubToken } = useAuth();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const addComment = useAddDiscussionComment();
  
  // Load draft from localStorage on component mount
  useEffect(() => {
    const draftKey = `discussion-${discussionNumber}-draft`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setComment(savedDraft);
    }
  }, [discussionNumber]);
  
  // Save draft to localStorage when comment changes (debounced)
  useEffect(() => {
    const draftKey = `discussion-${discussionNumber}-draft`;
    const debounceTimer = setTimeout(() => {
      if (comment.trim()) {
        localStorage.setItem(draftKey, comment);
      }
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [comment, discussionNumber]);
  
  // Handle keyboard shortcuts (Cmd+Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && textareaRef.current === document.activeElement) {
        e.preventDefault();
        handleSubmit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [comment]);
  
  const handleSubmit = async () => {
    if (!comment.trim() || !githubToken || !discussionId) return;
    
    setIsSubmitting(true);
    
    // Prepare optimistic comment
    const optimisticComment = {
      id: `optimistic-${Date.now()}`,
      bodyHTML: comment.replace(/\n/g, '<br>'),
      createdAt: new Date().toISOString(),
      author: {
        login: user?.login || 'You',
        avatarUrl: user?.avatarUrl,
        url: user?.url || '#'
      },
      isOptimistic: true,
      upvoteCount: 0,
      reactions: { nodes: [] }
    };
    
    // Optimistically update UI
    onCommentAdded(optimisticComment);
    
    try {
      // Send to GitHub API
      const result = await addComment.mutateAsync({
        discussionId,
        body: comment,
        token: githubToken
      });
      
      // Clear draft on success
      const draftKey = `discussion-${discussionNumber}-draft`;
      localStorage.removeItem(draftKey);
      setComment('');
      
      // Update with real comment from API
      const realComment = result?.addDiscussionComment?.comment;
      if (realComment) {
        onCommentAdded(realComment);
      }
      
      toast({
        title: "Comment posted",
        description: "Your comment has been successfully posted"
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Failed to post comment",
        description: "Your comment couldn't be posted, but it's saved as a draft",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-6 border rounded-md p-4 bg-card">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={user?.avatarUrl} alt={user?.login || 'You'} />
          <AvatarFallback>{user?.login?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <Textarea
            ref={textareaRef}
            placeholder="Write a comment... (Markdown supported)"
            className="min-h-24 resize-y"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 text-xs border rounded">Cmd</kbd> + <kbd className="px-1 py-0.5 text-xs border rounded">Enter</kbd> to submit
            </div>
            
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={!comment.trim() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
