
import React from 'react';
import { useRepo } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import RepoSidebar from '@/components/layout/RepoSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';

const Discussions = () => {
  const { activeRepository, activeCategory } = useRepo();
  const { user } = useAuth();
  
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
            
            <div className="bg-muted/40 rounded-lg p-12 text-center">
              <h3 className="text-xl font-medium mb-2">Discussions Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                Discussion list will be implemented in the next epic.
              </p>
              <Button>Back to Repositories</Button>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Discussions;
