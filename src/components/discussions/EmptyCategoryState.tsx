
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface EmptyCategoryStateProps {
  onShowTokenModal: () => void;
  onNavigateToRepositories: () => void;
}

const EmptyCategoryState = ({ onShowTokenModal, onNavigateToRepositories }: EmptyCategoryStateProps) => {
  return (
    <div className="bg-muted p-6 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
        <h3 className="text-lg font-medium">No Discussion Category Selected</h3>
      </div>
      <p className="text-muted-foreground mb-4">
        It looks like you don't have any discussion categories available for this repository. This could be due to:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mb-6">
        <li>Discussions are not enabled for this repository</li>
        <li>Your GitHub token doesn't have sufficient permissions (needs <code className="bg-accent px-1 py-0.5 rounded">repo</code> scope)</li>
        <li>No discussion categories have been created yet in the repository settings</li>
      </ul>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={onNavigateToRepositories}>
          Choose Another Repository
        </Button>
        <Button onClick={onShowTokenModal}>
          Update GitHub Token
        </Button>
      </div>
    </div>
  );
};

export default EmptyCategoryState;
