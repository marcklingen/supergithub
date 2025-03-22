
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface TokenRequiredStateProps {
  onShowTokenModal: () => void;
}

const TokenRequiredState = ({ onShowTokenModal }: TokenRequiredStateProps) => {
  return (
    <div className="bg-muted p-6 rounded-lg text-center">
      <div className="flex justify-center mb-4">
        <AlertCircle className="h-10 w-10 text-yellow-500" />
      </div>
      <h3 className="text-lg font-medium mb-4">GitHub Token Required</h3>
      <p className="text-muted-foreground mb-4">
        A GitHub personal access token with the following scopes is required to access 
        and interact with discussions:
      </p>
      <ul className="list-disc pl-8 text-left mb-6 space-y-2">
        <li><code className="bg-accent px-1 py-0.5 rounded">repo</code> - For repository access</li>
        <li><code className="bg-accent px-1 py-0.5 rounded">write:discussion</code> - For posting comments</li>
        <li><code className="bg-accent px-1 py-0.5 rounded">write:issue</code> - May be needed for certain repositories</li>
      </ul>
      <div className="flex justify-center space-x-2">
        <Button onClick={onShowTokenModal} size="lg">
          Set GitHub Token
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => window.open("https://github.com/settings/tokens", "_blank")}
        >
          Create Token on GitHub
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Note: Your token is stored locally in your browser and is never sent to our servers.
      </p>
    </div>
  );
};

export default TokenRequiredState;
