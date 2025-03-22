
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRepo, DiscussionCategory } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRepositoryDiscussionCategories } from '@/lib/github';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandShortcut } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { convertEmojiText } from '@/lib/utils';

const DiscussionCategories: React.FC = () => {
  const { activeRepository, setActiveCategory, activeCategory, categories } = useRepo();
  const { githubToken, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const token = githubToken || user?.user_metadata?.provider_token;
  
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useRepositoryDiscussionCategories(
    activeRepository?.owner || '', 
    activeRepository?.name || '', 
    token
  );
  
  // Set first category as active if data is loaded and no category is selected
  useEffect(() => {
    if (data?.repository?.discussionCategories?.nodes?.length > 0 && !activeCategory) {
      const firstCategory = data.repository.discussionCategories.nodes[0];
      setActiveCategory({
        id: firstCategory.id,
        name: firstCategory.name,
        emoji: firstCategory.emoji,
        description: firstCategory.description
      });
      
      // Only navigate to discussions if we're not already there or in a specific discussion
      if (!location.pathname.includes('/discussions')) {
        navigate('/discussions');
      }
    }
  }, [data, activeCategory, setActiveCategory, navigate, location.pathname]);
  
  // Add keyboard shortcut handling
  useEffect(() => {
    if (!data?.repository?.discussionCategories?.nodes?.length || !activeRepository) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when in discussion detail view or when typing in input fields
      if (location.pathname.includes('/discussions/') || 
          document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      // Use number keys 1-9 without modifier keys
      if (e.key >= '1' && e.key <= '9') {
        const numericIndex = parseInt(e.key) - 1;
        const categories = data.repository.discussionCategories.nodes;
        
        if (numericIndex >= 0 && numericIndex < categories.length) {
          e.preventDefault();
          const category = categories[numericIndex];
          setActiveCategory({
            id: category.id,
            name: category.name,
            emoji: category.emoji,
            description: category.description
          });
          navigate('/discussions');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, activeRepository, setActiveCategory, location.pathname, navigate]);
  
  const handleCategoryClick = (category: DiscussionCategory) => {
    setActiveCategory(category);
    navigate('/discussions');
  };
  
  const handleRefreshCategories = () => {
    refetch();
    toast({
      title: "Refreshing categories",
      description: "Attempting to reload discussion categories"
    });
  };
  
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-sidebar-foreground/70 px-2 h-8 flex items-center">
          Discussion Categories
        </h4>
        {activeRepository && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={handleRefreshCategories}
            disabled={isLoading}
            title="Refresh categories"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>
        )}
      </div>
      <div className="mt-1">
        {isLoading ? (
          <div className="p-4 flex justify-center">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="p-4">
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm flex gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p>Failed to load categories</p>
                <p className="text-xs mt-1 text-destructive/80">
                  {(error as Error)?.message || 'Check if discussions are enabled for this repository'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 h-7 text-xs w-full"
                  onClick={handleRefreshCategories}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        ) : !activeRepository ? (
          <div className="p-4 text-sm text-muted-foreground">
            Select a repository to view discussion categories.
          </div>
        ) : data?.repository?.hasDiscussionsEnabled === false ? (
          <div className="p-4 text-sm text-muted-foreground">
            Discussions are not enabled for this repository.
          </div>
        ) : !data?.repository?.discussionCategories?.nodes?.length ? (
          <div className="p-4 text-sm text-muted-foreground">
            No discussion categories found. Check if discussions are properly configured.
          </div>
        ) : (
          <ul className="space-y-1">
            {data?.repository?.discussionCategories?.nodes?.map((category: any, index: number) => (
              <li key={category.id}>
                <button 
                  onClick={() => handleCategoryClick({
                    id: category.id,
                    name: category.name,
                    emoji: category.emoji,
                    description: category.description
                  })}
                  className={`
                    flex items-center justify-between w-full rounded-md p-2 text-sm
                    ${activeCategory?.id === category.id ? 
                      'bg-accent text-accent-foreground' : 
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base" role="img" aria-label={category.name}>
                      {convertEmojiText(category.emoji)}
                    </span>
                    <span className="truncate">{category.name}</span>
                  </div>
                  {index < 9 && (
                    <CommandShortcut className="text-xs">{index + 1}</CommandShortcut>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DiscussionCategories;
