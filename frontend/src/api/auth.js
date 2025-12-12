import api from './axios';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (email, password) => {
  const response = await api.post('/auth/signup', { email, password });
  return response.data;
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    // Clear the token from localStorage
    localStorage.removeItem('authToken');
    return response.data;
  } catch (error) {
    // Even if the API call fails, we should clear the local token
    localStorage.removeItem('authToken');
    throw error;
  }
};