
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import RepoSidebar from '@/components/layout/RepoSidebar';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider } from '@/components/ui/sidebar';
import DiscussionList from '@/components/discussions/DiscussionList';
import DiscussionDetail from '@/components/discussions/DiscussionDetail';

const Discussions = () => {
  const { activeRepository, activeCategory } = useRepo();
  const { user } = useAuth();
  const { discussionNumber } = useParams<{ discussionNumber: string }>();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <RepoSidebar />
        
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto mt-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {activeCategory ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" role="img" aria-label={activeCategory.name}>
                        {activeCategory.emoji}
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
            </div>
            
            {discussionNumber ? (
              <DiscussionDetail />
            ) : (
              <DiscussionList />
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Discussions;
