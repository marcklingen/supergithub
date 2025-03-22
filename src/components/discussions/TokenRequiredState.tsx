
import React from 'react';
import { Button } from '@/components/ui/button';

interface TokenRequiredStateProps {
  onShowTokenModal: () => void;
}

const TokenRequiredState = ({ onShowTokenModal }: TokenRequiredStateProps) => {
  return (
    <div className="bg-muted p-6 rounded-lg text-center">
      <h3 className="text-lg font-medium mb-4">GitHub Token Required</h3>
      <p className="text-muted-foreground mb-4">
        A GitHub token with the <code className="bg-accent px-1 py-0.5 rounded">repo</code>, <code className="bg-accent px-1 py-0.5 rounded">write:discussion</code>, and <code className="bg-accent px-1 py-0.5 rounded">write:issue</code> scopes is required to access and interact with discussions. 
        Please set your token to continue.
      </p>
      <Button onClick={onShowTokenModal}>
        Set GitHub Token
      </Button>
    </div>
  );
};

export default TokenRequiredState;
