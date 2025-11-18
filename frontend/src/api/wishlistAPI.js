import axiosClient from './axiosClient';

export const wishlistAPI = {
  // Get user's wishlist
  getWishlist: async () => {
    const response = await axiosClient.get('/wishlist/');
    return response.data;
  },

  // Get specific wishlist item
  getWishlistItem: async (itemId) => {
    const response = await axiosClient.get(`/wishlist/${itemId}`);
    return response.data;
  },

  // Add item to wishlist
  addToWishlist: async (itemData) => {
    const response = await axiosClient.post('/wishlist/', itemData);
    return response.data;
  },

  // Update wishlist item
  updateWishlistItem: async (itemId, itemData) => {
    const response = await axiosClient.put(`/wishlist/${itemId}`, itemData);
    return response.data;
  },

  // Remove item from wishlist
  removeFromWishlist: async (itemId) => {
    const response = await axiosClient.delete(`/wishlist/${itemId}`);
    return response.data;
  },

  // Check if product is in wishlist
  checkInWishlist: async (productId, size = null, color = null) => {
    const params = new URLSearchParams();
    if (size) params.append('size', size);
    if (color) params.append('color', color);
    const query = params.toString();
    const url = `/wishlist/check/${productId}${query ? `?${query}` : ''}`;
    const response = await axiosClient.get(url);
    return response.data;
  },

  // Get wishlist statistics
  getWishlistStats: async () => {
    const response = await axiosClient.get('/wishlist/stats/');
    return response.data;
  }
};
