
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TokenRequiredStateProps {
  onShowTokenModal: () => void;
}

const TokenRequiredState = ({ onShowTokenModal }: TokenRequiredStateProps) => {
  const navigate = useNavigate();

  const handleReauthWithOrgAccess = () => {
    navigate('/auth?reauth=true&scope=read:org');
  };

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
        <li><code className="bg-accent px-1 py-0.5 rounded">repo</code> - For repository access (including private repositories)</li>
        <li><code className="bg-accent px-1 py-0.5 rounded">write:discussion</code> - For viewing and posting discussion comments</li>
        <li><code className="bg-accent px-1 py-0.5 rounded">write:issue</code> - May be needed for certain repositories</li>
        <li><code className="bg-accent px-1 py-0.5 rounded">read:org</code> - For access to organization repositories (optional)</li>
      </ul>
      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
        <Button onClick={onShowTokenModal} size="lg">
          Set GitHub Token
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => window.open("https://github.com/settings/tokens/new", "_blank")}
          className="flex items-center gap-1"
        >
          Create Token on GitHub
          <ExternalLink size={16} />
        </Button>
      </div>

      <div className="mt-4">
        <p className="text-muted-foreground mb-2">
          If you signed in with GitHub OAuth but need organization access:
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReauthWithOrgAccess}
          className="flex items-center gap-1"
        >
          Reconnect with Organization Access
        </Button>
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-left">
        <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2">Important Note About Tokens</h4>
        <p className="text-sm text-amber-700 dark:text-amber-500 mb-2">
          When creating your GitHub token, ensure you check the following boxes:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700 dark:text-amber-500">
          <li>Select the full <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">repo</code> scope checkbox (not the individual sub-options)</li>
          <li>This grants access to both public and private repositories</li>
          <li>Your token is stored locally in your browser and is never sent to our servers</li>
          <li>Add <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">read:org</code> to access organization repositories</li>
        </ul>
      </div>
    </div>
  );
};

export default TokenRequiredState;
