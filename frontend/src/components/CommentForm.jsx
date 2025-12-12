import React, { useState } from 'react';
import { createComment } from '../api/comments';
import { Button } from './ui/button';

const CommentForm = ({ postId, onCommentCreated }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const commentData = {
        content: content.trim(),
        post_id: postId
      };

      const newComment = await createComment(commentData);
      
      // Reset form
      setContent('');
      
      // Call success callback
      onCommentCreated(newComment);
    } catch (err) {
      console.error('Failed to create comment:', err);
      setError(err.detail || 'Failed to create comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-neutral-200">
      {error && (
        <div className="mb-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div className="flex gap-3">
        {/* Avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600">
          U
        </div>
        
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 text-sm border border-neutral-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            maxLength={500}
            disabled={loading}
          />
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              {content.length}/500 characters
            </div>
            
            <Button
              type="submit"
              size="sm"
              disabled={loading || !content.trim()}
            >
              {loading ? 'Posting...' : 'Comment'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;