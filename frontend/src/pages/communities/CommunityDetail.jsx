import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCommunityDetails } from '../../api/communities';
import { joinCommunity, leaveCommunity } from '../../api/memberships';
import { getCommunityPosts } from '../../api/posts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import CreatePostModal from '../../components/CreatePostModal';
import PostCard from '../../components/PostCard';
import ChatSection from '../../components/ChatSection';
import MembersSection from '../../components/MembersSection';

const CommunityDetail = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  
  const getCurrentUserRole = () => {
    return community?.is_owner ? 'owner' : 'member';
  };

  const fetchCommunityDetails = async () => {
    try {
      const data = await getCommunityDetails(communityId);
      setCommunity(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch community details:', err);
      setError(err.detail || 'Failed to load community details');
      
      if (err.status === 404) {
        navigate('/communities');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPosts = async () => {
    if (!community?.is_member) return;
    
    setPostsLoading(true);
    setPostsError(null);
    
    try {
      const result = await getCommunityPosts(communityId);
      setPosts(result.posts);
      setHasMorePosts(result.has_more);
    } catch (err) {
      console.error('Failed to fetch community posts:', err);
      setPostsError(err.detail || 'Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityDetails();
  }, [communityId]);

  useEffect(() => {
    if (community?.is_member) {
      fetchCommunityPosts();
    }
  }, [community?.is_member]);

  const handleJoinCommunity = async () => {
    setMembershipLoading(true);
    try {
      await joinCommunity(communityId);
      await fetchCommunityDetails();
    } catch (err) {
      console.error('Failed to join community:', err);
      setError(err.detail || 'Failed to join community');
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    setMembershipLoading(true);
    try {
      await leaveCommunity(communityId);
      await fetchCommunityDetails();
      setPosts([]);
    } catch (err) {
      console.error('Failed to leave community:', err);
      setError(err.detail || 'Failed to leave community');
    } finally {
      setMembershipLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchCommunityPosts();
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(currentPosts => currentPosts.filter(post => post.post_id !== deletedPostId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">Loading community...</div>
        </div>
      </div>
    );
  }

  if (error && !community) {
    return (
      <div className="min-h-screen bg-muted p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-red-600">{error}</div>
          <div className="text-center mt-4">
            <Link to="/communities">
              <Button variant="outline">← Back to Communities</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/communities">
            <Button variant="outline" size="sm">← Back</Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{community.name}</CardTitle>
                <CardDescription className="text-base mb-4">
                  {community.description || "No description provided."}
                </CardDescription>
                
                {/* Community Stats */}
                <div className="flex items-center gap-4 text-sm text-neutral-600">
                  <span>{community.member_count} {community.member_count === 1 ? 'member' : 'members'}</span>
                  <span>•</span>
                  <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Membership Actions */}
              <div className="flex flex-col items-end gap-2">
                {community.is_owner ? (
                  <div className="text-sm text-neutral-500 px-3 py-1 bg-neutral-100 rounded">
                    Community Owner
                  </div>
                ) : (
                  <Button
                    onClick={community.is_member ? handleLeaveCommunity : handleJoinCommunity}
                    disabled={membershipLoading}
                    variant={community.is_member ? "outline" : "default"}
                    className={community.is_member ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
                  >
                    {membershipLoading ? '...' : community.is_member ? 'Leave Community' : 'Join Community'}
                  </Button>
                )}
                
                {community.is_member && (
                  <div className="text-xs text-green-600">✓ You're a member</div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          communityId={parseInt(communityId)}
          onSuccess={handlePostCreated}
        />

        {(community.is_member || community.is_owner) && (
          <Card>
            <CardContent className="p-0">
              <div className="flex border-b border-neutral-200">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'posts'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  📝 Posts
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'members'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  👥 Members
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {!community.is_member && !community.is_owner ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-neutral-500">
                <div className="text-lg mb-2">🔒</div>
                <div>Join this community to access posts and chat.</div>
              </div>
            </CardContent>
          </Card>
        ) : activeTab === 'posts' ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Posts</CardTitle>
                <Button
                  onClick={() => setIsCreatePostModalOpen(true)}
                  size="sm"
                >
                  Create Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-center py-8 text-neutral-500">
                  Loading posts...
                </div>
              ) : postsError ? (
                <div className="text-center py-8 text-red-600">
                  {postsError}
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchCommunityPosts}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <div className="text-lg mb-2">📝</div>
                  <div>No posts yet in this community.</div>
                  <div className="text-sm mt-1">Be the first to share something!</div>
                  <div className="mt-4">
                    <Button
                      onClick={() => setIsCreatePostModalOpen(true)}
                      size="sm"
                    >
                      Create First Post
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {posts.map((post) => (
                    <PostCard
                      key={post.post_id}
                      post={post}
                      onPostDeleted={handlePostDeleted}
                    />
                  ))}
                  
                  {hasMorePosts && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // TODO: Implement pagination
                          console.log('Load more posts');
                        }}
                      >
                        Load More Posts
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : activeTab === 'chat' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatSection
                communityId={parseInt(communityId)}
                isVisible={activeTab === 'chat'}
              />
            </CardContent>
          </Card>
        ) : (
          /* Members Tab Content */
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Members</CardTitle>
            </CardHeader>
            <CardContent>
              <MembersSection
                communityId={parseInt(communityId)}
                isVisible={activeTab === 'members'}
                currentUserRole={getCurrentUserRole()}
                isOwner={community.is_owner}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunityDetail;