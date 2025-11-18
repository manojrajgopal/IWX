import axiosClient from './axiosClient';

export const userAPI = {
  // User-specific API calls
  updateProfile: async (userData) => {
    const response = await axiosClient.put('/auth/me', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  }
};
