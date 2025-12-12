import api from './axios';

export const getCommunities = async () => {
  const response = await api.get('/communities/');
  return response.data;
};

export const createCommunity = async (data) => {
  const response = await api.post('/communities/', data);
  return response.data;
};

export const updateCommunity = async (communityId, data) => {
  const response = await api.put(`/communities/${communityId}`, data);
  return response.data;
};

export const deleteCommunity = async (communityId) => {
  const response = await api.delete(`/communities/${communityId}`);
  return response.data;
};

export const getCommunity = async (communityId) => {
  const response = await api.get(`/communities/${communityId}`);
  return response.data;
};

export const getCommunityDetails = async (communityId) => {
  try {
    const response = await api.get(`/communities/${communityId}/details`);
    return response.data;
  } catch (error) {
    console.error('Get community details error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

