import axiosClient from './axiosClient';

export const orderAPI = {
  getOrders: async () => {
    const response = await axiosClient.get('/orders/');
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await axiosClient.post('/orders/', orderData);
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await axiosClient.get(`/orders/${orderId}`);
    return response.data;
  },

  getOrderByNumber: async (orderNumber) => {
    const response = await axiosClient.get(`/orders/by-number/${orderNumber}`);
    return response.data;
  }
};
