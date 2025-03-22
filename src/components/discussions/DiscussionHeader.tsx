
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { convertEmojiText } from '@/lib/utils';
import { DiscussionCategory } from '@/contexts/RepoContext';
import { Repository } from '@/contexts/RepoContext';

interface DiscussionHeaderProps {
  activeCategory: DiscussionCategory | null;
  activeRepository: Repository | null;
  githubToken: string | null;
  onShowTokenModal: () => void;
}

const DiscussionHeader = ({ 
  activeCategory, 
  activeRepository, 
  githubToken, 
  onShowTokenModal 
}: DiscussionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {activeCategory ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label={activeCategory.name}>
                {convertEmojiText(activeCategory.emoji)}
              </span>
              <span>{activeCategory.name} Discussions</span>
            </div>
          ) : (
            "Discussions"
          )}
        </h1>
        {activeRepository && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{activeRepository.fullName}</Badge>
            {activeCategory?.description && (
              <p className="text-muted-foreground text-sm">{activeCategory.description}</p>
            )}
          </div>
        )}
      </div>
      {!githubToken && (
        <Button variant="outline" onClick={onShowTokenModal}>
          Set GitHub Token
        </Button>
      )}
    </div>
  );
};

export default DiscussionHeader;
