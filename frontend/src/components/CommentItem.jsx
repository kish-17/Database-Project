import React, { useState } from 'react';
import { deleteComment } from '../api/comments';
import { Button } from './ui/button';

const CommentItem = ({ comment, onCommentDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteComment(comment.comment_id);
      onCommentDeleted(comment.comment_id);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes}m ago`;
      }
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b border-neutral-100 last:border-b-0">
      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600">
        {(comment.author_display_name || 'A')[0].toUpperCase()}
      </div>
      
      {/* Comment content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-neutral-900 text-sm">
            {comment.author_display_name || 'Anonymous'}
          </span>
          <span className="text-xs text-neutral-500">
            {formatDate(comment.created_at)}
          </span>
        </div>
        
        <div className="text-sm text-neutral-900 whitespace-pre-wrap">
          {comment.content}
        </div>
      </div>
      
      {/* Delete button for author */}
      {comment.is_author && (
        <div className="flex items-start">
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-6 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-6 px-2 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="h-6 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                {loading ? '...' : 'Confirm'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;