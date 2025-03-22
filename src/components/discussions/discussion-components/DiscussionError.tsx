
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

interface DiscussionErrorProps {
  error: Error;
  onBackClick: () => void;
}

export const DiscussionError: React.FC<DiscussionErrorProps> = ({ error, onBackClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={onBackClick}>
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>
      
      <Card className="border bg-destructive/10 text-destructive">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Error loading discussion</h3>
          <p>{error?.message || 'An unknown error occurred'}</p>
          <Button 
            variant="outline"
            className="mt-4"
            onClick={onBackClick}
          >
            Return to Discussions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
