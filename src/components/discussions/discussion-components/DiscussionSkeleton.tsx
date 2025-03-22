
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, MessageCircle } from 'lucide-react';

interface DiscussionSkeletonProps {
  onBackClick: () => void;
}

export const DiscussionSkeleton: React.FC<DiscussionSkeletonProps> = ({ onBackClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={onBackClick}>
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/6 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/6" />
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle size={18} />
          <Skeleton className="h-5 w-32" />
        </div>
        
        {[1, 2, 3].map(i => (
          <Card key={i} className="mb-4">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
