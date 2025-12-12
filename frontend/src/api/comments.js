import api from './axios';

export const createComment = async (commentData) => {
  try {
    const response = await api.post('/comments/', commentData);
    return response.data;
  } catch (error) {
    console.error('Create comment error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getPostComments = async (postId) => {
  try {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Get post comments error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getComment = async (commentId) => {
  try {
    const response = await api.get(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Get comment error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Delete comment error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};