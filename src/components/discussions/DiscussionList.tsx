import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRepo } from '@/contexts/RepoContext';
import { useRepositoryDiscussions } from '@/lib/github';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  ChevronRight, 
  User, 
  Clock,
  ArrowUp,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Discussion {
  id: string;
  number: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  upvoteCount: number;
  author: {
    login: string;
    avatarUrl: string;
  };
  comments: {
    totalCount: number;
  };
  labels?: {
    nodes: {
      id: string;
      name: string;
      color: string;
    }[];
  };
}

const DiscussionList = () => {
  const { githubToken } = useAuth();
  const { activeRepository, activeCategory } = useRepo();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [allDiscussions, setAllDiscussions] = useState<Discussion[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    isFetching,
    refetch
  } = useRepositoryDiscussions(
    activeRepository?.owner || '', 
    activeRepository?.name || '', 
    activeCategory?.id || '',
    10,
    cursor,
    githubToken
  );
  
  const discussions = data?.repository?.discussions?.nodes || [];
  const pageInfo = data?.repository?.discussions?.pageInfo;
  const totalCount = data?.repository?.discussions?.totalCount || 0;
  
  useEffect(() => {
    if (discussions.length > 0) {
      if (cursor) {
        setAllDiscussions(prev => {
          const existingIds = new Set(prev.map(d => d.id));
          const newDiscussions = discussions.filter(d => !existingIds.has(d.id));
          return [...prev, ...newDiscussions];
        });
      } else {
        setAllDiscussions(discussions);
      }
    }
  }, [discussions, cursor]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!allDiscussions.length) return;
      
      switch (e.key) {
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, allDiscussions.length - 1));
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < allDiscussions.length) {
            const discussion = allDiscussions[selectedIndex];
            navigate(`/discussions/${discussion.number}`);
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allDiscussions, selectedIndex, navigate]);
  
  useEffect(() => {
    if (location.pathname === '/discussions') {
      setCursor(undefined);
      if (!data && activeCategory?.id && activeRepository?.name) {
        refetch();
      }
    }
  }, [activeCategory?.id, activeRepository?.name, location.pathname, data, refetch]);
  
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.discussion-item');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex]);
  
  useEffect(() => {
    if (location.pathname === '/discussions' && allDiscussions.length === 0 && 
        activeCategory?.id && activeRepository?.name && !isLoading) {
      refetch();
    }
  }, [location.pathname, allDiscussions.length, activeCategory?.id, 
      activeRepository?.name, isLoading, refetch]);
  
  const handleLoadMore = () => {
    if (pageInfo?.hasNextPage) {
      setCursor(pageInfo.endCursor);
    }
  };
  
  const handleDiscussionClick = (discussion: Discussion) => {
    navigate(`/discussions/${discussion.number}`);
  };
  
  if (isLoading && !allDiscussions.length) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i} className="border">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-4 my-4">
        <h3 className="font-semibold mb-2">Error loading discussions</h3>
        <p>{(error as Error)?.message || 'An unknown error occurred'}</p>
      </div>
    );
  }
  
  if (allDiscussions.length === 0) {
    return (
      <Card className="border bg-muted/30 text-center p-8">
        <h3 className="text-lg font-medium mb-2">No discussions found</h3>
        <p className="text-muted-foreground mb-4">
          There are no discussions in this category yet.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Refresh Discussions
        </Button>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        {totalCount} {totalCount === 1 ? 'discussion' : 'discussions'} in this category
      </div>
      
      <div ref={listRef} className="space-y-2">
        {allDiscussions.map((discussion: Discussion, index: number) => (
          <Card 
            key={discussion.id}
            className={`discussion-item border hover:border-primary/50 transition-colors cursor-pointer ${
              selectedIndex === index ? 'border-primary bg-accent/40' : ''
            }`}
            onClick={() => handleDiscussionClick(discussion)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg truncate mb-1">{discussion.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={discussion.author.avatarUrl} alt={discussion.author.login} />
                        <AvatarFallback><User size={14} /></AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">{discussion.author.login}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={14} />
                      <span title={new Date(discussion.updatedAt).toLocaleString()}>
                        {formatDistanceToNow(new Date(discussion.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageCircle size={14} />
                      <span>{discussion.comments.totalCount}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ArrowUp size={14} />
                      <span>{discussion.upvoteCount}</span>
                    </div>
                  </div>
                  
                  {discussion.labels && discussion.labels.nodes.length > 0 && (
                    <div className="flex flex-wrap mt-2 gap-1.5">
                      {discussion.labels.nodes.map(label => (
                        <Badge 
                          key={label.id} 
                          variant="outline"
                          style={{
                            backgroundColor: `#${label.color}15`,
                            borderColor: `#${label.color}30`,
                          }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <ChevronRight 
                  size={16} 
                  className="text-muted-foreground mt-2 opacity-40 transition-opacity group-hover:opacity-100" 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {pageInfo?.hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            disabled={isFetching}
            className="w-full sm:w-auto"
          >
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
      
      <div className="mt-8 text-sm text-muted-foreground text-center">
        <p>
          Use <kbd className="px-1.5 py-0.5 rounded bg-muted border">j</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-muted border">k</kbd> or arrow keys to navigate discussions, 
          <kbd className="px-1.5 py-0.5 rounded bg-muted border">Enter</kbd> to select
        </p>
        <p className="mt-2">
          When viewing a discussion, use <kbd className="px-1.5 py-0.5 rounded bg-muted border">j</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-muted border">k</kbd> or arrow keys to navigate between threads
        </p>
      </div>
    </div>
  );
};

export default DiscussionList;
