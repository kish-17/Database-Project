import api from './axios';

export const createChatRoom = async (roomData) => {
  try {
    const response = await api.post('/chat/rooms', roomData);
    return response.data;
  } catch (error) {
    console.error('Create chat room error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getCommunityChatRooms = async (communityId) => {
  try {
    const response = await api.get(`/chat/rooms/community/${communityId}`);
    return response.data;
  } catch (error) {
    console.error('Get community chat rooms error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/chat/messages', messageData);
    return response.data;
  } catch (error) {
    console.error('Send message error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getChatMessages = async (chatId, skip = 0, limit = 50) => {
  try {
    const response = await api.get(`/chat/messages/${chatId}?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get chat messages error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};