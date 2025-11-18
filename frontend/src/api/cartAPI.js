import axiosClient from './axiosClient';

export const cartAPI = {
  getCart: async () => {
    const response = await axiosClient.get('/orders/cart/');
    return response.data;
  },

  addToCart: async (productId, quantity = 1, size = null, color = null) => {
    const params = new URLSearchParams();
    params.append('product_id', productId);
    params.append('quantity', quantity.toString());
    if (size) params.append('size', size);
    if (color) params.append('color', color);

    const response = await axiosClient.post(`/orders/cart/add/?${params.toString()}`);
    return response.data;
  },

  updateCartQuantity: async (productId, quantity, size = null, color = null) => {
    const params = new URLSearchParams();
    params.append('product_id', productId);
    params.append('quantity', quantity.toString());
    if (size) params.append('size', size);
    if (color) params.append('color', color);

    const response = await axiosClient.put(`/orders/cart/update/?${params.toString()}`);
    return response.data;
  },

  removeFromCart: async (productId, size = null, color = null) => {
    const params = new URLSearchParams();
    params.append('product_id', productId);
    if (size) params.append('size', size);
    if (color) params.append('color', color);

    const response = await axiosClient.delete(`/orders/cart/remove/?${params.toString()}`);
    return response.data;
  }
};
