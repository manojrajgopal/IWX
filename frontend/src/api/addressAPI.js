import axiosClient from './axiosClient';

export const addressAPI = {
  // Get all user addresses
  getAddresses: async () => {
    const response = await axiosClient.get('/addresses/');
    return response.data;
  },

  // Get specific address
  getAddress: async (addressId) => {
    const response = await axiosClient.get(`/addresses/${addressId}`);
    return response.data;
  },

  // Create new address
  createAddress: async (addressData) => {
    const response = await axiosClient.post('/addresses/', addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await axiosClient.put(`/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await axiosClient.delete(`/addresses/${addressId}`);
    return response.data;
  },

  // Set address as default
  setDefaultAddress: async (addressId) => {
    const response = await axiosClient.put(`/addresses/${addressId}/default`);
    return response.data;
  }
};
