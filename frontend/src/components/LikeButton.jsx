import React, { useState, useEffect } from 'react';
import { togglePostLike, getPostLikeStatus } from '../api/likes';
import { Button } from './ui/button';

const LikeButton = ({ postId, initialLikeCount = 0, initialIsLiked = false }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // Fetch current like status on mount if not provided
  useEffect(() => {
    if (initialLikeCount === 0 && !initialIsLiked) {
      fetchLikeStatus();
    }
  }, [postId]);

  const fetchLikeStatus = async () => {
    try {
      const status = await getPostLikeStatus(postId);
      setIsLiked(status.is_liked);
      setLikeCount(status.like_count);
    } catch (err) {
      console.error('Failed to fetch like status:', err);
    }
  };

  const handleToggleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const result = await togglePostLike(postId);
      setIsLiked(result.is_liked);
      setLikeCount(result.like_count);
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Could show error message here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center gap-1 ${
        isLiked 
          ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' 
          : 'text-neutral-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
      }`}
    >
      <span className={`text-sm ${loading ? 'animate-pulse' : ''}`}>
        {isLiked ? '❤️' : '🤍'}
      </span>
      <span className="text-sm">
        {loading ? '...' : likeCount}
      </span>
    </Button>
  );
};

export default LikeButton;