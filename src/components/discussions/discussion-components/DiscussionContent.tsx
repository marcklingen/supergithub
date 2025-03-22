
import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, MessageCircle, ArrowUp } from 'lucide-react';
import { convertEmojiText } from '@/lib/utils';

interface DiscussionContentProps {
  discussion: any; // Ideally we'd have a proper type here
}

export const DiscussionContent: React.FC<DiscussionContentProps> = ({ discussion }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl" role="img" aria-label={discussion.category.name}>
              {convertEmojiText(discussion.category.emoji)}
            </span>
            <Badge variant="outline">{discussion.category.name}</Badge>
          </div>
          <h2 className="text-2xl font-semibold">{discussion.title}</h2>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Avatar className="h-6 w-6">
            <AvatarImage src={discussion.author.avatarUrl} alt={discussion.author.login} />
            <AvatarFallback><User size={12} /></AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <a 
              href={discussion.author.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              {discussion.author.login}
            </a>
            
            <span>•</span>
            <span>
              {format(new Date(discussion.createdAt), 'PPP')}
            </span>
            
            <span>•</span>
            <div className="flex items-center gap-1">
              <MessageCircle size={12} />
              <span>{discussion.comments.totalCount}</span>
            </div>
            
            <span>•</span>
            <div className="flex items-center gap-1">
              <ArrowUp size={12} />
              <span>{discussion.upvoteCount}</span>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-full max-h-[60vh] pr-4 -mr-4">
          <div 
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: discussion.bodyHTML }}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
