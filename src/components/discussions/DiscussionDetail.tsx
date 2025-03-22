
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscussionDetails, useRepositoryDiscussions } from '@/lib/github';
import ThreadNavigation from './ThreadNavigation';
import { format, formatDistanceToNow } from 'date-fns';
import {
  User,
  Clock,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  ChevronLeft,
  Loader2,
  Github,
  MessageSquare
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DiscussionDetail = () => {
  const params = useParams();
  const { githubToken } = useAuth();
  const { activeRepository, activeCategory } = useRepo();
  const navigate = useNavigate();
  
  const discussionNumber = Number(params.discussionNumber);
  
  const {
    data,
    isLoading,
    isError,
    error,
  } = useDiscussionDetails(
    activeRepository?.owner || '',
    activeRepository?.name || '',
    discussionNumber,
    githubToken
  );
  
  const { data: discussionsData } = useRepositoryDiscussions(
    activeRepository?.owner || '',
    activeRepository?.name || '',
    activeCategory?.id || '',
    50, // Fetch more discussions to have a complete list for navigation
    undefined,
    githubToken
  );
  
  const discussions = discussionsData?.repository?.discussions?.nodes || [];
  
  // Find the current index
  const currentIndex = discussions.findIndex(
    (discussion) => discussion.number === discussionNumber
  );
  
  const prevDiscussion = currentIndex > 0 ? discussions[currentIndex - 1] : null;
  const nextDiscussion = currentIndex < discussions.length - 1 ? discussions[currentIndex + 1] : null;
  
  const navigateTo = (discussion: any) => {
    if (discussion) {
      navigate(`/discussions/${discussion.number}`);
    }
  };
  
  const discussion = data?.repository?.discussion;
  
  const handleBackClick = () => {
    navigate('/discussions');
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={handleBackClick}>
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/6 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/6" />
          </CardContent>
        </Card>
        
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={18} />
            <Skeleton className="h-5 w-32" />
          </div>
          
          {[1, 2, 3].map(i => (
            <Card key={i} className="mb-4">
              <CardHeader className="py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={handleBackClick}>
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
        </div>
        
        <Card className="border bg-destructive/10 text-destructive">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Error loading discussion</h3>
            <p>{(error as Error)?.message || 'An unknown error occurred'}</p>
            <Button 
              variant="outline"
              className="mt-4"
              onClick={handleBackClick}
            >
              Return to Discussions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!discussion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={handleBackClick}>
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
        </div>
        
        <Card className="border bg-muted/30 text-center p-8">
          <h3 className="text-lg font-medium mb-2">Discussion not found</h3>
          <p className="text-muted-foreground mb-4">
            The discussion you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={handleBackClick}>
            Return to Discussions
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={handleBackClick}>
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo(prevDiscussion)}
                  disabled={!prevDiscussion}
                >
                  <ArrowUp className="h-4 w-4" />
                  <span className="sr-only">Previous discussion</span>
                  <kbd className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded">k</kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Previous discussion (k)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo(nextDiscussion)}
                  disabled={!nextDiscussion}
                >
                  <ArrowDown className="h-4 w-4" />
                  <span className="sr-only">Next discussion</span>
                  <kbd className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded">j</kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Next discussion (j)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <a href={`https://github.com/${activeRepository?.owner}/${activeRepository?.name}/discussions/${discussion.number}`} target="_blank" rel="noopener noreferrer">
              <Github size={14} className="mr-1.5" />
              Open on GitHub
              <kbd className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded">o</kbd>
            </a>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-xl" role="img" aria-label={discussion.category.name}>
                    {discussion.category.emoji}
                  </span>
                  <Badge variant="outline">{discussion.category.name}</Badge>
                </div>
              </div>
              <h2 className="text-2xl font-semibold">{discussion.title}</h2>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={discussion.author.avatarUrl} alt={discussion.author.login} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <div>
                <a 
                  href={discussion.author.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                >
                  {discussion.author.login}
                </a>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(discussion.createdAt), 'PPP')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageCircle size={14} />
                <span>{discussion.comments.totalCount}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <ArrowUp size={14} />
                <span>{discussion.upvoteCount}</span>
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-full max-h-[60vh] pr-4 -mr-4">
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: discussion.bodyHTML }}
            />
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare size={18} />
          <h3 className="text-lg font-medium">
            Comments ({discussion.comments.totalCount})
          </h3>
        </div>
        
        {discussion.comments.nodes.length === 0 ? (
          <Card className="border bg-muted/30 text-center p-6">
            <p className="text-muted-foreground">
              No comments yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {discussion.comments.nodes.map((comment: any) => (
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
        
        {discussion.comments.pageInfo?.hasNextPage && (
          <div className="flex justify-center mt-6">
            <Button variant="outline">
              Load More Comments
            </Button>
          </div>
        )}
      </div>
      
      <ThreadNavigation currentDiscussionNumber={discussionNumber} />
    </>
  );
};

export default DiscussionDetail;
