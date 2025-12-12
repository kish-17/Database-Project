import React, { useState, useEffect } from 'react';
import { getPostComments } from '../api/comments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

const CommentsSection = ({ postId, isVisible }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch comments when section becomes visible
  const fetchComments = async () => {
    if (!isVisible) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getPostComments(postId);
      setComments(result.comments);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError(err.detail || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchComments();
    }
  }, [isVisible, postId]);

  // Handle new comment creation
  const handleCommentCreated = (newComment) => {
    setComments(prev => [...prev, newComment]);
  };

  // Handle comment deletion
  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(comment => comment.comment_id !== commentId));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-neutral-200">
      {loading && (
        <div className="text-center py-4 text-sm text-neutral-500">
          Loading comments...
        </div>
      )}
      
      {error && (
        <div className="text-center py-4 text-sm text-red-600">
          {error}
          <div className="mt-2">
            <button
              onClick={fetchComments}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}
      
      {!loading && !error && (
        <>
          {/* Comments list */}
          {comments.length > 0 ? (
            <div className="space-y-0">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.comment_id}
                  comment={comment}
                  onCommentDeleted={handleCommentDeleted}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-neutral-500">
              No comments yet. Be the first to comment!
            </div>
          )}
          
          {/* Comment form */}
          <CommentForm
            postId={postId}
            onCommentCreated={handleCommentCreated}
          />
        </>
      )}
    </div>
  );
};

export default CommentsSection;