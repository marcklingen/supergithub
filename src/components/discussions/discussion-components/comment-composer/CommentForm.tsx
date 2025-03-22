
import React from 'react';
import { Loader2, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentFormProps {
  user: any;
  comment: string;
  isSubmitting: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  user,
  comment,
  isSubmitting,
  textareaRef,
  onCommentChange,
  onSubmit
}) => {
  return (
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
          onChange={(e) => onCommentChange(e.target.value)}
          disabled={isSubmitting}
        />
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 text-xs border rounded">Cmd</kbd> + <kbd className="px-1 py-0.5 text-xs border rounded">Enter</kbd> to submit
          </div>
          
          <Button 
            type="button" 
            onClick={onSubmit}
            disabled={!comment.trim() || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
