import api from './axios';

export const createPost = async (postData) => {
  try {
    const response = await api.post('/posts/', postData);
    return response.data;
  } catch (error) {
    console.error('Create post error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getCommunityPosts = async (communityId, skip = 0, limit = 20) => {
  try {
    const response = await api.get(`/posts/community/${communityId}?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get community posts error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getPost = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Get post error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updatePost = async (postId, updateData) => {
  try {
    const response = await api.put(`/posts/${postId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Update post error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Delete post error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};