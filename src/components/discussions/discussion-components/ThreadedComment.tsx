
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, ArrowUp, Loader2, MessageCircle, Reply } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ThreadedCommentProps {
  comment: any;
  depth?: number;
  maxDepth?: number;
  onReplyClick?: (commentId: string) => void;
}

export const ThreadedComment: React.FC<ThreadedCommentProps> = ({ 
  comment, 
  depth = 0,
  maxDepth = 3,
  onReplyClick
}) => {
  // Check if this comment has replies
  const hasReplies = comment.replies && comment.replies.nodes && comment.replies.nodes.length > 0;
  
  return (
    <div className="comment-thread">
      <Card 
        key={comment.id} 
        className={`border ${comment.isOptimistic ? 'bg-muted/10 border-dashed' : ''}`}
      >
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.author.avatarUrl} alt={comment.author.login} />
                <AvatarFallback><User size={12} /></AvatarFallback>
              </Avatar>
              <div>
                <a 
                  href={comment.author.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-sm hover:underline"
                >
                  {comment.author.login}
                </a>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                  {comment.isOptimistic && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" />
                        Posting...
                      </span>
                    </>
                  )}
                  {comment.replyTo && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={10} />
                        Reply
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {comment.upvoteCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUp size={12} />
                <span>{comment.upvoteCount}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert text-sm"
            dangerouslySetInnerHTML={{ __html: comment.bodyHTML }}
          />
        </CardContent>
        <CardFooter className="p-2 flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {comment.reactions && comment.reactions.nodes.length > 0 && (
              comment.reactions.nodes.map((reaction: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs py-0 px-1.5 h-5">
                  {reaction.content}
                </Badge>
              ))
            )}
          </div>
          
          {depth < 1 && onReplyClick && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="ml-auto gap-1 text-xs h-6 px-2" 
              onClick={() => onReplyClick(comment.id)}
            >
              <Reply size={12} />
              Reply
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Render replies if they exist and we haven't reached max depth */}
      {hasReplies && depth < maxDepth && (
        <div className="ml-4 mt-1 pl-2 border-l-2 border-muted">
          {comment.replies.nodes.map((reply: any) => (
            <div key={reply.id} className="mt-1">
              <ThreadedComment 
                comment={reply} 
                depth={depth + 1}
                maxDepth={maxDepth}
                onReplyClick={onReplyClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
