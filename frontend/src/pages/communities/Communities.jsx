import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCommunities } from '../../api/communities';
import { logout } from '../../api/auth';
import { joinCommunity, leaveCommunity, getMembershipStatus } from '../../api/memberships';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import CreateCommunityModal from '../../components/CreateCommunityModal';
import EditCommunityModal from '../../components/EditCommunityModal';

const Communities = () => {
  // 1. Memory: Start with an empty list of communities
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [communityToEdit, setCommunityToEdit] = useState(null);
  const [memberships, setMemberships] = useState({}); // Track membership status for each community
  const [membershipLoading, setMembershipLoading] = useState({}); // Track loading state for join/leave actions
  const navigate = useNavigate();

  // 2. Action: Run this when the page loads
  const fetchCommunities = async () => {
    try {
      const data = await getCommunities();
      setCommunities(data);
      setError(null);
      
      // Fetch membership statuses for all communities
      await fetchMembershipStatuses(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load communities.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch membership status for all communities
  const fetchMembershipStatuses = async (communityList) => {
    const membershipStatusMap = {};
    
    // Fetch membership status for each community in parallel
    const membershipPromises = communityList.map(async (community) => {
      try {
        const status = await getMembershipStatus(community.community_id);
        membershipStatusMap[community.community_id] = status.is_member;
      } catch (err) {
        // If there's an error (e.g., not authenticated), assume not a member
        membershipStatusMap[community.community_id] = false;
      }
    });
    
    await Promise.all(membershipPromises);
    setMemberships(membershipStatusMap);
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCommunityCreated = () => {
    setLoading(true);
    fetchCommunities();
  };

  const handleEditCommunity = (community) => {
    setCommunityToEdit(community);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setCommunityToEdit(null);
  };

  const handleCommunityUpdated = () => {
    setLoading(true);
    fetchCommunities();
  };

  // Handle joining a community
  const handleJoinCommunity = async (communityId) => {
    setMembershipLoading(prev => ({ ...prev, [communityId]: true }));
    
    try {
      await joinCommunity(communityId);
      setMemberships(prev => ({ ...prev, [communityId]: true }));
    } catch (err) {
      console.error('Failed to join community:', err);
      setError(err.detail || 'Failed to join community');
    } finally {
      setMembershipLoading(prev => ({ ...prev, [communityId]: false }));
    }
  };

  // Handle leaving a community
  const handleLeaveCommunity = async (communityId) => {
    setMembershipLoading(prev => ({ ...prev, [communityId]: true }));
    
    try {
      await leaveCommunity(communityId);
      setMemberships(prev => ({ ...prev, [communityId]: false }));
    } catch (err) {
      console.error('Failed to leave community:', err);
      setError(err.detail || 'Failed to leave community');
    } finally {
      setMembershipLoading(prev => ({ ...prev, [communityId]: false }));
    }
  };

  // Check if current user owns a community (based on localStorage token)
  const getCurrentUserId = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      // Decode JWT token to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub; // Supabase uses 'sub' for user ID
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redirect to login page after logout
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout API fails, clear local storage and redirect
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading communities...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900">Communities</h1>
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="outline">👤 Profile</Button>
            </Link>
            <Button onClick={() => setIsModalOpen(true)}>Create Community</Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            >
              Logout
            </Button>
          </div>
        </div>

        <CreateCommunityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCommunityCreated}
        />

        <EditCommunityModal
          community={communityToEdit}
          isOpen={editModalOpen}
          onClose={handleEditClose}
          onSuccess={handleCommunityUpdated}
        />

        {communities.length === 0 ? (
          <div className="text-center text-neutral-500 py-10">
            No communities found. Be the first to create one!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {communities.map((community) => {
              const isOwner = currentUserId && community.created_by === currentUserId;
              const isMember = memberships[community.community_id] || false;
              const isLoadingMembership = membershipLoading[community.community_id] || false;
              
              return (
                <Card key={community.community_id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <Link 
                      to={`/communities/${community.community_id}`}
                      className="flex-1 hover:text-blue-600 transition-colors"
                    >
                      <CardTitle className="text-base">{community.name}</CardTitle>
                    </Link>
                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCommunity(community)}
                        className="ml-2 h-8 w-8 p-0"
                      >
                        ✏️
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link 
                      to={`/communities/${community.community_id}`}
                      className="block hover:text-blue-600 transition-colors"
                    >
                      <CardDescription className="line-clamp-3 mb-3">
                        {community.description || "No description provided."}
                      </CardDescription>
                    </Link>
                    
                    {/* Membership Status and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-neutral-500">
                        {isOwner ? 'You own this community' : 
                         isMember ? '✓ Member' : 
                         'Not a member'}
                      </div>
                      
                      {/* Join/Leave Button - only show if not owner */}
                      {!isOwner && (
                        <Button
                          size="sm"
                          variant={isMember ? "outline" : "default"}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            isMember ? handleLeaveCommunity(community.community_id) : handleJoinCommunity(community.community_id);
                          }}
                          disabled={isLoadingMembership}
                          className={isMember ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
                        >
                          {isLoadingMembership ? '...' : isMember ? 'Leave' : 'Join'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Communities;
