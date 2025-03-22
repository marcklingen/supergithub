
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, ArrowUp, Reply } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
        <CardContent className="p-3">
          {/* Single line header with all elements */}
          <div className="flex items-center justify-between space-x-2 mb-2">
            <div className="flex items-center min-w-0 flex-1">
              <Avatar className="h-5 w-5 mr-1.5">
                <AvatarImage src={comment.author.avatarUrl} alt={comment.author.login} />
                <AvatarFallback><User size={10} /></AvatarFallback>
              </Avatar>
              
              <div className="flex items-center gap-1.5 text-xs overflow-hidden">
                <a 
                  href={comment.author.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium hover:underline whitespace-nowrap text-ellipsis overflow-hidden"
                >
                  {comment.author.login}
                </a>
                
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                
                {comment.isOptimistic && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="flex items-center gap-0.5 text-muted-foreground whitespace-nowrap">
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Posting...</span>
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-auto shrink-0">
              {comment.upvoteCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowUp size={10} />
                  <span>{comment.upvoteCount}</span>
                </div>
              )}
              
              {onReplyClick && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-5 px-1 text-xs" 
                  onClick={() => onReplyClick(comment.id)}
                >
                  <Reply size={12} className="mr-1" />
                  <span className="hidden sm:inline">Reply</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Comment content */}
          <div 
            className="prose prose-sm max-w-none dark:prose-invert text-xs"
            dangerouslySetInnerHTML={{ __html: comment.bodyHTML }}
          />
          
          {/* Reactions (if any) */}
          {comment.reactions && comment.reactions.nodes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {comment.reactions.nodes.map((reaction: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs py-0 px-1 h-4">
                  {reaction.content}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Render replies if they exist and we haven't reached max depth */}
      {hasReplies && depth < maxDepth && (
        <div className="ml-3 mt-1 pl-2 border-l border-muted">
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
