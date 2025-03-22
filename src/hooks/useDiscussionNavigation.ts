
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Discussion } from '@/lib/github';

interface UseDiscussionNavigationProps {
  prevDiscussion: Discussion | null;
  nextDiscussion: Discussion | null;
  discussionNumber: number;
  replyingToCommentId: string | null;
  onCancelReply: () => void;
  activeRepository: { owner: string; name: string } | null;
}

export const useDiscussionNavigation = ({
  prevDiscussion,
  nextDiscussion,
  discussionNumber,
  replyingToCommentId,
  onCancelReply,
  activeRepository,
}: UseDiscussionNavigationProps) => {
  const navigate = useNavigate();

  const navigateTo = (discussion: Discussion | null) => {
    if (discussion) {
      navigate(`/discussions/${discussion.number}`);
    }
  };

  const handleBackClick = () => {
    navigate('/discussions');
  };

  const focusCommentComposer = (commentComposerRef: React.RefObject<HTMLDivElement>) => {
    if (!replyingToCommentId) {
      if (commentComposerRef.current) {
        commentComposerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const textarea = commentComposerRef.current.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.metaKey ||
        e.ctrlKey
      ) {
        return;
      }
      
      switch (e.key) {
        case 'k':
          e.preventDefault();
          if (prevDiscussion) {
            navigateTo(prevDiscussion);
          }
          break;
        case 'j':
          e.preventDefault();
          if (nextDiscussion) {
            navigateTo(nextDiscussion);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (replyingToCommentId) {
            onCancelReply();
          } else {
            handleBackClick();
          }
          break;
        case 'o':
          e.preventDefault();
          if (activeRepository) {
            window.open(`https://github.com/${activeRepository.owner}/${activeRepository.name}/discussions/${discussionNumber}`, '_blank');
          }
          break;
        case 'r':
          e.preventDefault();
          focusCommentComposer({ current: document.querySelector('[data-comment-composer]') as HTMLDivElement });
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevDiscussion, nextDiscussion, activeRepository, discussionNumber, replyingToCommentId]);

  return {
    navigateTo,
    handleBackClick,
    focusCommentComposer
  };
};
