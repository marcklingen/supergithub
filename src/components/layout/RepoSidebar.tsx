
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, ArrowLeft, Github, Copy, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RepoSidebar = () => {
  const { activeRepository, repositories } = useRepo();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!activeRepository) {
    return (
      <div className="w-60 border-r h-full flex flex-col p-4 bg-background">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No repository selected
          </p>
          <Button 
            variant="link" 
            className="mt-2" 
            onClick={() => navigate('/repositories')}
          >
            Select a repository
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-60 border-r h-full flex flex-col bg-background">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground w-8 h-8 p-0"
            onClick={() => navigate('/repositories')}
            title="Back to repositories"
          >
            <ArrowLeft size={16} />
          </Button>
          
          <span className="text-xs font-medium">GitHub Discussions</span>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-8 h-8 p-0"
            onClick={() => window.open(`https://github.com/${activeRepository.fullName}/discussions`, '_blank')}
            title="Open in GitHub"
          >
            <Github size={16} />
          </Button>
        </div>
        
        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-secondary/50">
          <span className="text-xs font-medium truncate max-w-[160px]" title={activeRepository.fullName}>
            {activeRepository.fullName}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-6 w-6 p-0 text-muted-foreground"
            onClick={() => {
              navigator.clipboard.writeText(activeRepository.fullName);
              toast({
                description: "Repository name copied to clipboard",
              });
            }}
            title="Copy repo name"
          >
            <Copy size={12} />
          </Button>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Link 
              to="/discussions" 
              className="text-sm font-medium hover:text-primary transition-colors flex items-center"
            >
              <MessageSquare size={16} className="mr-1.5" />
              All Discussions
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="p-3 border-t">
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="justify-start"
            onClick={() => navigate('/github-token')}
          >
            <Lock size={14} className="mr-2" />
            GitHub Token Info
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RepoSidebar;
