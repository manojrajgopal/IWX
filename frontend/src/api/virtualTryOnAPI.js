import axiosClient from './axiosClient';

const virtualTryOnAPI = {
  tryOn: async (personImage, garmentImageUrl, productId) => {
    const formData = new FormData();
    formData.append('vton_image', personImage);

    // Fetch the garment image from URL and convert to file
    try {
      const response = await fetch(garmentImageUrl);
      const blob = await response.blob();
      const garmentFile = new File([blob], 'garment.jpg', { type: 'image/jpeg' });
      formData.append('garment_image', garmentFile);
    } catch (error) {
      throw new Error('Failed to fetch garment image');
    }

    if (productId) {
      formData.append('product_id', productId);
    }

    try {
      const response = await axiosClient.post('/api/virtual-try-on', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for processing
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getImages: async (productId) => {
    try {
      const response = await axiosClient.get(`/api/virtual-try-on/images/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default virtualTryOnAPI;