
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReplyHeaderProps {
  replyToComment: any;
  onCancelReply?: () => void;
}

export const ReplyHeader: React.FC<ReplyHeaderProps> = ({ 
  replyToComment, 
  onCancelReply 
}) => {
  if (!replyToComment) return null;
  
  return (
    <div className="flex justify-between items-center mb-3 pb-3 border-b">
      <div className="text-sm text-muted-foreground">
        Replying to <span className="font-medium">{replyToComment.author.login}</span>
      </div>
      {onCancelReply && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0" 
          onClick={onCancelReply}
        >
          <X size={16} />
          <span className="sr-only">Cancel reply</span>
        </Button>
      )}
    </div>
  );
};
