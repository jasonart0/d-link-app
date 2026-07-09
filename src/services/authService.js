import apiClient from './apiClient';

export const authService = {
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    const token = response?.token || response?.accessToken || response?.access_token;

    if (token) {
      apiClient.setAuthToken(token);
    }

    return response;
  },

  logout() {
    apiClient.clearAuthToken();
  },
};

export default authService;
