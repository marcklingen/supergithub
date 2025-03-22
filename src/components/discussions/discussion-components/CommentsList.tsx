
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, User, ArrowUp } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommentsListProps {
  comments: {
    totalCount: number;
    nodes: any[];
    pageInfo?: {
      hasNextPage: boolean;
    }
  };
}

export const CommentsList: React.FC<CommentsListProps> = ({ comments }) => {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={18} />
        <h3 className="text-lg font-medium">
          Comments ({comments.totalCount})
        </h3>
      </div>
      
      {comments.nodes.length === 0 ? (
        <Card className="border bg-muted/30 text-center p-6">
          <p className="text-muted-foreground">
            No comments yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.nodes.map((comment: any) => (
            <Card key={comment.id} className="border">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatarUrl} alt={comment.author.login} />
                      <AvatarFallback><User size={14} /></AvatarFallback>
                    </Avatar>
                    <div>
                      <a 
                        href={comment.author.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {comment.author.login}
                      </a>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  {comment.upvoteCount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ArrowUp size={14} />
                      <span>{comment.upvoteCount}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: comment.bodyHTML }}
                />
              </CardContent>
              {comment.reactions && comment.reactions.nodes.length > 0 && (
                <CardFooter className="p-4 pt-0 flex-wrap gap-1">
                  {comment.reactions.nodes.map((reaction: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {reaction.content}
                    </Badge>
                  ))}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {comments.pageInfo?.hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button variant="outline">
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  );
};
