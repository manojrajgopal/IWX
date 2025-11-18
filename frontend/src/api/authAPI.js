import axiosClient from './axiosClient';

export const authAPI = {
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      remember_me: credentials.remember_me || false
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      // Return null instead of mock data to trigger proper error handling
      return null;
    }
  },

  updateCurrentUser: async (updateData) => {
    try {
      const response = await axiosClient.put('/auth/me', updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  refreshToken: async () => {
    const response = await axiosClient.post('/auth/refresh-token');
    return response.data;
  },

  googleLogin: async () => {
    const response = await axiosClient.get('/auth/google/login');
    return response.data;
  },

  getGoogleAuthData: async (sessionId) => {
    const response = await axiosClient.get(`/auth/google/session/${sessionId}`);
    return response.data;
  }
};
