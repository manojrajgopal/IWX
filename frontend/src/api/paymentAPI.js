import axiosClient from './axiosClient';

export const paymentAPI = {
  // Get all user payment methods
  getPaymentMethods: async () => {
    const response = await axiosClient.get('/payments/');
    return response.data;
  },

  // Get specific payment method
  getPaymentMethod: async (paymentId) => {
    const response = await axiosClient.get(`/payments/${paymentId}`);
    return response.data;
  },

  // Create new payment method
  createPaymentMethod: async (paymentData) => {
    const response = await axiosClient.post('/payments/', paymentData);
    return response.data;
  },

  // Update payment method
  updatePaymentMethod: async (paymentId, paymentData) => {
    const response = await axiosClient.put(`/payments/${paymentId}`, paymentData);
    return response.data;
  },

  // Delete payment method
  deletePaymentMethod: async (paymentId) => {
    const response = await axiosClient.delete(`/payments/${paymentId}`);
    return response.data;
  },

  // Set payment method as default
  setDefaultPaymentMethod: async (paymentId) => {
    const response = await axiosClient.put(`/payments/${paymentId}/default`);
    return response.data;
  },

  // Get billing history
  getBillingHistory: async (skip = 0, limit = 50) => {
    const response = await axiosClient.get(`/payments/billing/history/?skip=${skip}&limit=${limit}`);
    return response.data;
  }
};
