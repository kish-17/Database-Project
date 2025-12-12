import api from './axios';

export const togglePostLike = async (postId) => {
  try {
    const response = await api.post(`/likes/toggle/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Toggle like error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getPostLikeStatus = async (postId) => {
  try {
    const response = await api.get(`/likes/status/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Get like status error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};