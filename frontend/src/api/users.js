import api from './axios';

export const getMyProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateMyProfile = async (data) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};
