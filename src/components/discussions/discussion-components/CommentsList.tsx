
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThreadedComment } from './ThreadedComment';

interface CommentsListProps {
  comments: {
    totalCount: number;
    nodes: any[];
    pageInfo?: {
      hasNextPage: boolean;
    }
  };
  onReplyClick?: (commentId: string) => void;
}

export const CommentsList: React.FC<CommentsListProps> = ({ comments, onReplyClick }) => {
  // Only show top-level comments (comments that don't have a replyTo field)
  const topLevelComments = comments.nodes.filter(comment => !comment.replyTo);
  const totalCommentsCount = comments.totalCount + comments.nodes.filter((c: any) => c.isOptimistic).length;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-1.5 mb-2">
        <MessageSquare size={14} />
        <h3 className="text-sm font-medium">
          Comments ({totalCommentsCount})
        </h3>
      </div>
      
      {topLevelComments.length === 0 ? (
        <Card className="border bg-muted/30 text-center p-3">
          <p className="text-muted-foreground text-xs">
            No comments yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-1">
          {topLevelComments.map((comment: any) => (
            <ThreadedComment 
              key={comment.id} 
              comment={comment} 
              onReplyClick={onReplyClick}
            />
          ))}
        </div>
      )}
      
      {comments.pageInfo?.hasNextPage && (
        <div className="flex justify-center mt-3">
          <Button variant="outline" size="sm" className="text-xs h-7 px-2">
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  );
};
