
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyRepositoryStateProps {
  onNavigateToRepositories: () => void;
}

const EmptyRepositoryState = ({ onNavigateToRepositories }: EmptyRepositoryStateProps) => {
  return (
    <div className="bg-muted p-6 rounded-lg text-center">
      <h3 className="text-lg font-medium mb-4">Select a Repository</h3>
      <p className="text-muted-foreground mb-4">
        Please select a repository from the sidebar to view discussions.
      </p>
      <Button onClick={onNavigateToRepositories}>
        Manage Repositories
      </Button>
    </div>
  );
};

export default EmptyRepositoryState;
