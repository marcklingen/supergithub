
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useRepositoryDiscussions } from '@/lib/github';
import { useAuth } from '@/contexts/AuthContext';
import { convertEmojiText } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ThreadNavigationProps {
  currentDiscussionNumber: number;
}

const ThreadNavigation: React.FC<ThreadNavigationProps> = ({ currentDiscussionNumber }) => {
  const navigate = useNavigate();
  const { activeRepository, activeCategory } = useRepo();
  const { githubToken } = useAuth();
  
  const { data } = useRepositoryDiscussions(
    activeRepository?.owner || '',
    activeRepository?.name || '',
    activeCategory?.id || '',
    50, // Fetch more discussions to have a complete list for navigation
    undefined,
    githubToken
  );

  const discussions = data?.repository?.discussions?.nodes || [];
  
  // Find the current index
  const currentIndex = discussions.findIndex(
    (discussion) => discussion.number === currentDiscussionNumber
  );
  
  const prevDiscussion = currentIndex > 0 ? discussions[currentIndex - 1] : null;
  const nextDiscussion = currentIndex < discussions.length - 1 ? discussions[currentIndex + 1] : null;
  
  const navigateTo = (discussion: any) => {
    if (discussion) {
      navigate(`/discussions/${discussion.number}`);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      
      switch (e.key) {
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          if (prevDiscussion) {
            navigateTo(prevDiscussion);
          }
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          if (nextDiscussion) {
            navigateTo(nextDiscussion);
          }
          break;
        case 'o':
          e.preventDefault();
          if (activeRepository) {
            window.open(`https://github.com/${activeRepository.owner}/${activeRepository.name}/discussions/${currentDiscussionNumber}`, '_blank');
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevDiscussion, nextDiscussion, activeRepository, currentDiscussionNumber]);
  
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="shortcut"
              size="icon"
              onClick={() => navigateTo(prevDiscussion)}
              disabled={!prevDiscussion}
              className="rounded-full shadow-md"
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Previous (k)</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Previous thread (k)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="shortcut"
              size="icon"
              onClick={() => navigateTo(nextDiscussion)}
              disabled={!nextDiscussion}
              className="rounded-full shadow-md"
            >
              <ArrowDown className="h-4 w-4" />
              <span className="sr-only">Next (j)</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Next thread (j)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ThreadNavigation;
