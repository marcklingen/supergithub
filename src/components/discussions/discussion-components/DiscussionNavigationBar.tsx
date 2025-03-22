
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  ChevronLeft, 
  ArrowUp, 
  ArrowDown, 
  Github 
} from 'lucide-react';
import { Repository } from '@/contexts/RepoContext';

interface DiscussionNavigationBarProps {
  prevDiscussion: any;
  nextDiscussion: any;
  navigateTo: (discussion: any) => void;
  onBackClick: () => void;
  activeRepository: Repository | null;
  discussionNumber: number;
}

export const DiscussionNavigationBar: React.FC<DiscussionNavigationBarProps> = ({
  prevDiscussion,
  nextDiscussion,
  navigateTo,
  onBackClick,
  activeRepository,
  discussionNumber,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onBackClick}>
              <ChevronLeft size={16} className="mr-1" />
              Back <kbd className="ml-1 text-xs">ESC</kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go back to list (ESC)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="shortcut"
                size="sm"
                onClick={() => navigateTo(prevDiscussion)}
                disabled={!prevDiscussion}
                className="shadow-sm"
              >
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="sr-only md:not-sr-only md:inline-block">Previous</span>
                <kbd className="hidden md:inline-block">k</kbd>
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
                variant="shortcut"
                size="sm"
                onClick={() => navigateTo(nextDiscussion)}
                disabled={!nextDiscussion}
                className="shadow-sm"
              >
                <ArrowDown className="h-4 w-4 mr-1" />
                <span className="sr-only md:not-sr-only md:inline-block">Next</span>
                <kbd className="hidden md:inline-block">j</kbd>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next discussion (j)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button 
          variant="shortcut" 
          size="sm" 
          asChild
          className="shadow-sm"
        >
          <a href={`https://github.com/${activeRepository?.owner}/${activeRepository?.name}/discussions/${discussionNumber}`} target="_blank" rel="noopener noreferrer">
            <Github size={14} className="mr-1.5" />
            <span className="sr-only md:not-sr-only md:inline-block">Open on GitHub</span>
            <kbd className="hidden md:inline-block">o</kbd>
          </a>
        </Button>
      </div>
    </div>
  );
};
