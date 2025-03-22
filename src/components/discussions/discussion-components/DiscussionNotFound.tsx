
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

interface DiscussionNotFoundProps {
  onBackClick: () => void;
}

export const DiscussionNotFound: React.FC<DiscussionNotFoundProps> = ({ onBackClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={onBackClick}>
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>
      
      <Card className="border bg-muted/30 text-center p-8">
        <h3 className="text-lg font-medium mb-2">Discussion not found</h3>
        <p className="text-muted-foreground mb-4">
          The discussion you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={onBackClick}>
          Return to Discussions
        </Button>
      </Card>
    </div>
  );
};
