
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
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={16} />
        <h3 className="text-base font-medium">
          Comments ({totalCommentsCount})
        </h3>
      </div>
      
      {topLevelComments.length === 0 ? (
        <Card className="border bg-muted/30 text-center p-4">
          <p className="text-muted-foreground text-sm">
            No comments yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
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
        <div className="flex justify-center mt-4">
          <Button variant="outline" size="sm">
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  );
};
