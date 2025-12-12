import React, { useState } from 'react';
import { deletePost } from '../api/posts';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import CommentsSection from './CommentsSection';
import LikeButton from './LikeButton';

const PostCard = ({ post, onPostDeleted, onPostEdit }) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deletePost(post.post_id);
      onPostDeleted(post.post_id);
    } catch (err) {
      console.error('Failed to delete post:', err);
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
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-neutral-900">
                {post.author_display_name || 'Anonymous'}
              </span>
              <span className="text-sm text-neutral-500">
                {formatDate(post.created_at)}
              </span>
              {post.updated_at && post.updated_at !== post.created_at && (
                <span className="text-xs text-neutral-400">(edited)</span>
              )}
            </div>
          </div>
          
          {/* Author actions */}
          {post.is_author && (
            <div className="flex items-center gap-2">
              {onPostEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPostEdit(post)}
                  className="h-8 px-2 text-xs"
                >
                  Edit
                </Button>
              )}
              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  Delete
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-8 px-2 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={loading}
                    className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {loading ? '...' : 'Confirm'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Post content */}
        <div className="whitespace-pre-wrap text-neutral-900 mb-3">
          {post.content}
        </div>
        
        {/* Media content */}
        {post.media_url && (
          <div className="mt-3">
            {post.media_type === 'image' ? (
              <img
                src={post.media_url}
                alt="Post attachment"
                className="max-w-full rounded-lg border"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <a
                href={post.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                🔗 Attachment
              </a>
            )}
          </div>
        )}

        {/* Like and Comments actions */}
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-3">
            <LikeButton postId={post.post_id} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-neutral-600 hover:text-neutral-900"
            >
              {showComments ? 'Hide Comments' : 'Show Comments'} 💬
            </Button>
          </div>
        </div>

        {/* Comments section */}
        <CommentsSection
          postId={post.post_id}
          isVisible={showComments}
        />
      </CardContent>
    </Card>
  );
};

export default PostCard;