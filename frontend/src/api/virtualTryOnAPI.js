import axios from 'axios';

const virtualTryOnAPI = {
  tryOn: async (personImage, garmentImageUrl) => {
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

    try {
      const response = await axios.post('http://localhost:8011/api/virtual-try-on', formData, {
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
};

export default virtualTryOnAPI;