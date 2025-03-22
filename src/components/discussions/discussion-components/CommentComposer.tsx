import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Send, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAddDiscussionComment } from '@/lib/github';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  const { user, githubToken, setManualGithubToken } = useAuth();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const addComment = useAddDiscussionComment();
  
  useEffect(() => {
    const draftKey = `discussion-${discussionNumber}-draft`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setComment(savedDraft);
    }
  }, [discussionNumber]);
  
  useEffect(() => {
    const draftKey = `discussion-${discussionNumber}-draft`;
    const debounceTimer = setTimeout(() => {
      if (comment.trim()) {
        localStorage.setItem(draftKey, comment);
      }
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [comment, discussionNumber]);
  
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
    
    const optimisticComment = {
      id: `optimistic-${Date.now()}`,
      bodyHTML: comment.replace(/\n/g, '<br>'),
      createdAt: new Date().toISOString(),
      author: {
        login: userDisplayName,
        avatarUrl: userAvatarUrl,
        url: userProfileUrl
      },
      isOptimistic: true,
      upvoteCount: 0,
      reactions: { nodes: [] }
    };
    
    onCommentAdded(optimisticComment);
    
    try {
      const result = await addComment.mutateAsync({
        discussionId,
        body: comment,
        token: githubToken
      });
      
      console.log("Comment API response:", result);
      
      const draftKey = `discussion-${discussionNumber}-draft`;
      localStorage.removeItem(draftKey);
      setComment('');
      
      const realComment = result?.addDiscussionComment?.comment;
      if (realComment) {
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
    <div className="mt-6 border rounded-md p-4 bg-card">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || 'Anonymous'} />
          <AvatarFallback>{(user?.email?.[0] || 'A').toUpperCase()}</AvatarFallback>
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
          
          {errorMessage && (
            <Alert variant="destructive" className="mb-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error: {errorMessage}</AlertTitle>
              <AlertDescription className="mt-1">
                <p>Your comment was saved as a draft and will be available when you return.</p>
                {showTokenHelp && (
                  <div className="mt-2">
                    <p>
                      This is likely because your GitHub token doesn't have the necessary permissions.
                      You need to re-authenticate with GitHub to get a token with proper scopes:
                    </p>
                    <ul className="list-disc ml-5 my-2 text-sm">
                      <li>The <code className="bg-background/30 px-1 rounded">repo</code> scope for access to repositories</li>
                      <li>The <code className="bg-background/30 px-1 rounded">write:discussion</code> scope for discussions</li>
                      <li>The <code className="bg-background/30 px-1 rounded">write:issue</code> scope may also be needed</li>
                    </ul>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={handleReauth}
                    >
                      Re-authenticate with GitHub
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
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
