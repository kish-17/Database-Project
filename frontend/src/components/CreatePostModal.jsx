import React, { useState } from 'react';
import { createPost } from '../api/posts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

const CreatePostModal = ({ isOpen, onClose, communityId, onSuccess }) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const postData = {
        content: content.trim(),
        community_id: communityId,
        media_url: mediaUrl.trim() || null,
        media_type: mediaUrl.trim() ? 'image' : null
      };

      await createPost(postData);
      
      setContent('');
      setMediaUrl('');
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create post:', err);
      setError(err.detail || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setMediaUrl('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Create New Post
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                What's on your mind?
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts with the community..."
                className="w-full p-3 border border-neutral-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                maxLength={1000}
                disabled={loading}
              />
              <div className="text-xs text-neutral-500 mt-1">
                {content.length}/1000 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Image URL (optional)
              </label>
              <Input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !content.trim()}
                className="flex-1"
              >
                {loading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostModal;