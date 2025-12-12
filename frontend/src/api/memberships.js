import api from './axios';

export const joinCommunity = async (communityId) => {
  try {
    const response = await api.post(`/memberships/join/${communityId}`);
    return response.data;
  } catch (error) {
    console.error('Join community error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const leaveCommunity = async (communityId) => {
  try {
    const response = await api.delete(`/memberships/leave/${communityId}`);
    return response.data;
  } catch (error) {
    console.error('Leave community error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getMembershipStatus = async (communityId) => {
  try {
    const response = await api.get(`/memberships/status/${communityId}`);
    return response.data;
  } catch (error) {
    console.error('Get membership status error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getMyCommunities = async () => {
  try {
    const response = await api.get('/memberships/my-communities');
    return response.data;
  } catch (error) {
    console.error('Get my communities error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getCommunityMembers = async (communityId) => {
  try {
    const response = await api.get(`/memberships/community/${communityId}/members`);
    return response.data;
  } catch (error) {
    console.error('Get community members error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateMemberRole = async (communityId, targetUserId, newRole) => {
  try {
    const response = await api.put(`/memberships/community/${communityId}/members/${targetUserId}/role`, {
      new_role: newRole
    });
    return response.data;
  } catch (error) {
    console.error('Update member role error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};