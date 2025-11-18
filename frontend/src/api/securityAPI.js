import axiosClient from './axiosClient';

export const securityAPI = {
  // Get security settings
  getSecuritySettings: async () => {
    const response = await axiosClient.get('/security/settings/');
    return response.data;
  },

  // Update security settings
  updateSecuritySettings: async (settingsData) => {
    const response = await axiosClient.put('/security/settings/', settingsData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axiosClient.put('/security/password/', passwordData);
    return response.data;
  },

  // Enable two-factor authentication
  enableTwoFactor: async () => {
    const response = await axiosClient.post('/security/two-factor/enable/');
    return response.data;
  },

  // Verify two-factor setup
  verifyTwoFactorSetup: async (verificationData) => {
    const response = await axiosClient.post('/security/two-factor/verify/', verificationData);
    return response.data;
  },

  // Disable two-factor authentication
  disableTwoFactor: async () => {
    const response = await axiosClient.delete('/security/two-factor/');
    return response.data;
  },

  // Get login history
  getLoginHistory: async (limit = 50) => {
    const response = await axiosClient.get(`/security/login-history/?limit=${limit}`);
    return response.data;
  },

  // Get connected devices
  getConnectedDevices: async () => {
    const response = await axiosClient.get('/security/devices/');
    return response.data;
  },

  // Get security statistics
  getSecurityStats: async () => {
    const response = await axiosClient.get('/security/stats/');
    return response.data;
  },

  // Deactivate account
  deactivateAccount: async (deactivationData) => {
    const response = await axiosClient.delete('/security/account/', { data: deactivationData });
    return response.data;
  }
};
