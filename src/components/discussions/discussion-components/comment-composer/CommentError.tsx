
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface CommentErrorProps {
  errorMessage: string;
  showTokenHelp: boolean;
  handleReauth: () => void;
}

export const CommentError: React.FC<CommentErrorProps> = ({
  errorMessage,
  showTokenHelp,
  handleReauth
}) => {
  if (!errorMessage) return null;
  
  return (
    <Alert variant="destructive" className="mb-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error: {errorMessage}</AlertTitle>
      <AlertDescription className="mt-1">
        <p>Your comment was saved as a draft and will be available when you return.</p>
        {showTokenHelp && (
          <div className="mt-2">
            <p>
              This is likely because your GitHub token doesn't have the necessary permissions.
              You need to re-authenticate with GitHub to get a token with proper scopes:
            </p>
            <ul className="list-disc ml-5 my-2 text-sm">
              <li>The <code className="bg-background/30 px-1 rounded">repo</code> scope for access to repositories</li>
              <li>The <code className="bg-background/30 px-1 rounded">write:discussion</code> scope for discussions</li>
              <li>The <code className="bg-background/30 px-1 rounded">write:issue</code> scope may also be needed</li>
            </ul>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={handleReauth}
            >
              Re-authenticate with GitHub
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
