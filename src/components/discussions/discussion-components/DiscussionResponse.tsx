
import React, { useRef } from 'react';
import { CommentsList } from './CommentsList';
import { CommentComposer } from './CommentComposer';

interface DiscussionResponseProps {
  discussion: any;
  allComments: any;
  replyingToCommentId: string | null;
  replyToComment: any;
  discussionNumber: number;
  onReplyClick: (commentId: string) => void;
  onCancelReply: () => void;
  onCommentAdded: (newComment: any) => void;
}

export const DiscussionResponse: React.FC<DiscussionResponseProps> = ({
  discussion,
  allComments,
  replyingToCommentId,
  replyToComment,
  discussionNumber,
  onReplyClick,
  onCancelReply,
  onCommentAdded
}) => {
  const commentComposerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <CommentsList 
        comments={allComments} 
        onReplyClick={onReplyClick}
      />
      
      <div ref={commentComposerRef} data-comment-composer>
        {replyingToCommentId ? (
          <CommentComposer 
            discussionId={discussion.id}
            discussionNumber={discussionNumber}
            onCommentAdded={onCommentAdded}
            replyToId={replyingToCommentId}
            replyToComment={replyToComment}
            onCancelReply={onCancelReply}
          />
        ) : (
          <CommentComposer 
            discussionId={discussion.id} 
            discussionNumber={discussionNumber}
            onCommentAdded={onCommentAdded}
          />
        )}
      </div>
    </>
  );
};
